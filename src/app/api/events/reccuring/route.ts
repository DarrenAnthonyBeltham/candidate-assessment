import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, location, category, startTime, endTime, capacity, 
            frequency, endDate } = body; 

    const seriesId = uuidv4();
    const occurrences = [];
    let currentStart = new Date(startTime);
    let currentEnd = new Date(endTime);
    const finalDate = new Date(endDate);

    while (currentStart <= finalDate) {
      occurrences.push({
        title,
        description,
        location,
        category,
        creatorId: session.user.id,
        seriesId,
        isRecurring: true,
        timeSlots: {
          create: [{
            startTime: new Date(currentStart),
            endTime: new Date(currentEnd),
            capacity: parseInt(capacity),
            remainingCapacity: parseInt(capacity),
          }]
        }
      });

      if (frequency === 'DAILY') currentStart.setDate(currentStart.getDate() + 1);
      if (frequency === 'WEEKLY') currentStart.setDate(currentStart.getDate() + 7);
      if (frequency === 'MONTHLY') currentStart.setMonth(currentStart.getMonth() + 1);
      
      currentEnd = new Date(currentStart.getTime() + (new Date(endTime).getTime() - new Date(startTime).getTime()));
    }
    
    await prisma.$transaction(
      occurrences.map(occ => prisma.event.create({ data: occ }))
    );

    return NextResponse.json({ message: `Created ${occurrences.length} occurrences`, seriesId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
  }
}