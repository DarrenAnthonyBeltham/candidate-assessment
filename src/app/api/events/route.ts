import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user?.email 
      ? await prisma.user.findUnique({ where: { email: session.user.email } }) 
      : null;
    
    const userPrefs = user?.preferences || [];

    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        isRecurring: true,
        timeSlots: {
          select: {
            id: true,
            startTime: true,
            remainingCapacity: true,
            capacity: true,
            version: true
          },
          orderBy: { startTime: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sortedEvents = events.sort((a, b) => {
      const aMatch = userPrefs.includes(a.category) ? 1 : 0;
      const bMatch = userPrefs.includes(b.category) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;

      const aDate = a.timeSlots[0]?.startTime.getTime() || 0;
      const bDate = b.timeSlots[0]?.startTime.getTime() || 0;
      if (aDate !== bDate) return aDate - bDate;

      const aCap = a.timeSlots[0]?.remainingCapacity || 0;
      const bCap = b.timeSlots[0]?.remainingCapacity || 0;
      return bCap - aCap;
    });

    return NextResponse.json(sortedEvents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admins only.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, location, category, startTime, endTime, capacity } = body;

    if (!title || !startTime || !endTime || !capacity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const capInt = parseInt(capacity);

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        category: category || 'General',
        creatorId: session.user.id,
        timeSlots: {
          create: [
            {
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              capacity: capInt,
              remainingCapacity: capInt,
            },
          ],
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}