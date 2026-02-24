import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const UNDO_WINDOW_MS = 2 * 60 * 1000; 

  try {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { timeSlot: true }
      });

      if (!booking || booking.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Invalid booking' }, { status: 400 });
      }

      const timePassed = Date.now() - new Date(booking.updatedAt).getTime();
      if (timePassed > UNDO_WINDOW_MS) {
        return NextResponse.json({ error: 'Undo window (2 mins) has expired' }, { status: 400 });
      }

      if (booking.timeSlot.remainingCapacity < booking.spots) {
        return NextResponse.json({ error: 'Spots were taken by waitlist. Cannot undo.' }, { status: 409 });
      }

      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { remainingCapacity: { decrement: booking.spots } }
      });

      const updated = await tx.booking.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });

      return NextResponse.json(updated);
    });
  } catch (error) {
    return NextResponse.json({ error: 'Undo failed' }, { status: 500 });
  }
}