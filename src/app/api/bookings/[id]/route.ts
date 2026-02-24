import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { timeSlot: true }
    });

    if (!booking || (booking.userId !== session.user.id && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: { 
          remainingCapacity: { increment: booking.spots },
          version: { increment: 1 }
        }
      });

      const nextInLine = await tx.waitlist.findFirst({
        where: { 
          timeSlotId: booking.timeSlotId, 
          status: 'PENDING' 
        },
        orderBy: { createdAt: 'asc' }
      });

      if (nextInLine) {
        const slot = await tx.timeSlot.findUnique({
          where: { id: booking.timeSlotId }
        });

        if (slot && slot.remainingCapacity >= nextInLine.spots) {
          await tx.booking.create({
            data: {
              userId: nextInLine.userId,
              timeSlotId: nextInLine.timeSlotId,
              spots: nextInLine.spots,
              status: 'ACTIVE'
            }
          });

          await tx.waitlist.update({
            where: { id: nextInLine.id },
            data: { status: 'PROMOTED' }
          });

          await tx.timeSlot.update({
            where: { id: booking.timeSlotId },
            data: { 
              remainingCapacity: { decrement: nextInLine.spots } 
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}