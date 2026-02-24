import { NextResponse } from 'next/server';
import prisma from '../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, timeSlotId, spots } = body;

    if (!userId || !timeSlotId || !spots) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const spotsNum = parseInt(spots);
    if (spotsNum < 1 || spotsNum > 5) {
      return NextResponse.json({ error: 'You can only book between 1 and 5 spots' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const timeSlot = await tx.timeSlot.findUnique({
        where: { id: timeSlotId },
      });

      if (!timeSlot) {
        throw new Error('NOT_FOUND');
      }

      const existingBooking = await tx.booking.findUnique({
        where: { userId_timeSlotId: { userId, timeSlotId } },
      });

      if (existingBooking && existingBooking.status === 'ACTIVE') {
        throw new Error('ALREADY_BOOKED');
      }

      const overlappingBookings = await tx.booking.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          timeSlot: {
            AND: [
              { startTime: { lt: timeSlot.endTime } },
              { endTime: { gt: timeSlot.startTime } },
            ],
          },
        },
      });

      if (overlappingBookings) {
        throw new Error('OVERLAP_CONFLICT');
      }

      if (timeSlot.remainingCapacity < spotsNum) {
        const waitlistEntry = await tx.waitlist.create({
          data: {
            userId,
            timeSlotId,
            spots: spotsNum,
            status: 'PENDING'
          }
        });
        return { type: 'WAITLIST', data: waitlistEntry };
      }

      const updatedSlot = await tx.timeSlot.updateMany({
        where: {
          id: timeSlotId,
          version: timeSlot.version, 
          remainingCapacity: { gte: spotsNum },
        },
        data: {
          remainingCapacity: { decrement: spotsNum },
          version: { increment: 1 },
        },
      });

      if (updatedSlot.count === 0) {
        throw new Error('CONCURRENCY_ERROR');
      }

      const newBooking = await tx.booking.create({
        data: {
          userId,
          timeSlotId,
          spots: spotsNum,
          status: 'ACTIVE',
        },
      });

      return { type: 'BOOKING', data: newBooking };
    });

    if (result.type === 'WAITLIST') {
      return NextResponse.json({ 
        message: 'Slot is full. You have been added to the waitlist.', 
        waitlistEntry: result.data 
      }, { status: 200 });
    }

    return NextResponse.json(result.data, { status: 201 });

  } catch (error: any) {
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Session expired or user no longer exists. Please log out and log back in.' },
        { status: 401 }
      );
    }
    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 });
    }
    if (error.message === 'ALREADY_BOOKED') {
      return NextResponse.json({ error: 'You have already booked this time slot' }, { status: 400 });
    }
    if (error.message === 'OVERLAP_CONFLICT') {
      return NextResponse.json({ error: 'This time slot overlaps with an existing booking' }, { status: 409 });
    }
    if (error.message === 'CONCURRENCY_ERROR') {
      return NextResponse.json(
        { error: 'Someone else just booked the available spots. Please try again.' },
        { status: 409 }
      );
    }

    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}