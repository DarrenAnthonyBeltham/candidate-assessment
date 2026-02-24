import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, timeSlotId, spots } = body;

    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId }
    });

    if (!timeSlot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (timeSlot.remainingCapacity < spots) {
      await prisma.waitlist.create({
        data: {
          userId,
          timeSlotId,
          spots,
          status: 'PENDING'
        }
      });
      return NextResponse.json({ message: 'Added to waitlist' }, { status: 201 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      await tx.timeSlot.update({
        where: { id: timeSlotId, version: timeSlot.version },
        data: {
          remainingCapacity: { decrement: spots },
          version: { increment: 1 }
        }
      });

      const newBooking = await tx.booking.create({
        data: {
          userId,
          timeSlotId,
          spots,
          status: 'ACTIVE'
        }
      });
      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already booked this slot' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}