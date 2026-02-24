import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { seriesId } = await params;
    const now = new Date();

    if (!prisma) {
      throw new Error('Database client not initialized');
    }

    await prisma.event.deleteMany({
      where: {
        seriesId: seriesId,
        timeSlots: {
          some: {
            startTime: { gt: now }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Future series occurrences deleted successfully' 
    });
  } catch (error) {
    console.error('Series Delete Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}