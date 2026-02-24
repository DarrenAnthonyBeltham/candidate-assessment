import 'dotenv/config';
import { PrismaClient, Role, BookingStatus, WaitListStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "Event", "TimeSlot", "Booking", "Waitlist" CASCADE;');

  const passwordHash = await bcrypt.hash('password123', 10);
  const now = new Date();

  const admin = await prisma.user.create({
    data: { email: 'admin@test.com', name: 'Admin', passwordHash, role: Role.ADMIN }
  });

  const sUsers = [];
  for (let i = 1; i <= 30; i++) {
    sUsers.push(await prisma.user.create({
      data: { email: `reviewer${i}@test.com`, name: `Reviewer ${i}`, passwordHash, role: Role.USER }
    }));
  }

  const s1 = await prisma.event.create({
    data: {
      title: 'Expert UI/UX Architecture', description: 'Scenario 1', location: 'Jakarta', category: 'Design', creatorId: admin.id,
      timeSlots: {
        create: [
          { startTime: new Date(now.getTime() + 86400000), endTime: new Date(now.getTime() + 90000000), capacity: 3, remainingCapacity: 0 },
          { startTime: new Date(now.getTime() + 172800000), endTime: new Date(now.getTime() + 176400000), capacity: 10, remainingCapacity: 2 }
        ]
      }
    }, include: { timeSlots: true }
  });
  for (let i = 0; i < 3; i++) {
    await prisma.waitlist.create({ data: { userId: sUsers[i].id, timeSlotId: s1.timeSlots[0].id, spots: 1, status: WaitListStatus.PENDING, createdAt: new Date(now.getTime() + i * 1000) } });
  }

  const s2P = await prisma.event.create({ data: { title: 'Past Tech Symposium', description: 'Scenario 2', location: 'Room A', category: 'Tech', creatorId: admin.id, timeSlots: { create: { startTime: new Date(now.getTime() - 86400000), endTime: new Date(now.getTime() - 82800000), capacity: 5, remainingCapacity: 0 } } }, include: { timeSlots: true } });
  const s2F = await prisma.event.create({ data: { title: 'Upcoming Design Summit', description: 'Scenario 2', location: 'Room B', category: 'Design', creatorId: admin.id, timeSlots: { create: { startTime: new Date(now.getTime() + 259200000), endTime: new Date(now.getTime() + 262800000), capacity: 10, remainingCapacity: 9 } } }, include: { timeSlots: true } });
  await prisma.booking.create({ data: { userId: sUsers[9].id, timeSlotId: s2P.timeSlots[0].id, spots: 1, status: BookingStatus.ACTIVE } });
  await prisma.booking.create({ data: { userId: sUsers[9].id, timeSlotId: s2F.timeSlots[0].id, spots: 1, status: BookingStatus.ACTIVE } });
  await prisma.waitlist.create({ data: { userId: sUsers[9].id, timeSlotId: s1.timeSlots[0].id, spots: 1, status: WaitListStatus.PENDING } });

  await prisma.event.create({
    data: {
      title: 'Hybrid Cloud Masterclass', description: 'Scenario 3', location: 'Virtual', category: 'Tech', creatorId: admin.id,
      timeSlots: {
        create: [
          { startTime: new Date(now.getTime() + 345600000), endTime: new Date(now.getTime() + 350000000), capacity: 10, remainingCapacity: 10 },
          { startTime: new Date(now.getTime() + 432000000), endTime: new Date(now.getTime() + 440000000), capacity: 5, remainingCapacity: 0 },
          { startTime: new Date(now.getTime() + 518400000), endTime: new Date(now.getTime() + 520000000), capacity: 10, remainingCapacity: 1 }
        ]
      }
    }
  });

  const s4 = await prisma.event.create({ data: { title: 'Product Strategy Sync', description: 'Scenario 4', location: 'Room 5', category: 'General', creatorId: admin.id, timeSlots: { create: { startTime: new Date(now.getTime() + 604800000), endTime: new Date(now.getTime() + 610000000), capacity: 1, remainingCapacity: 0 } } }, include: { timeSlots: true } });
  await prisma.booking.create({ data: { userId: sUsers[19].id, timeSlotId: s4.timeSlots[0].id, spots: 1, status: BookingStatus.CANCELLED } });
  await prisma.waitlist.create({ data: { userId: sUsers[20].id, timeSlotId: s4.timeSlots[0].id, spots: 1, status: WaitListStatus.PROMOTED, isRead: false } });
  await prisma.booking.create({ data: { userId: sUsers[20].id, timeSlotId: s4.timeSlots[0].id, spots: 1, status: BookingStatus.ACTIVE } });

  const ost = new Date(now.getTime() + 691200000);
  const oed = new Date(now.getTime() + 698400000);
  const s5a = await prisma.event.create({ data: { title: 'Mobile Bootcamp (A)', description: 'Scenario 5', location: 'X', category: 'Tech', creatorId: admin.id, timeSlots: { create: { startTime: ost, endTime: oed, capacity: 5, remainingCapacity: 4 } } }, include: { timeSlots: true } });
  const s5b = await prisma.event.create({ data: { title: 'Design Workshop (B)', description: 'Scenario 5', location: 'Y', category: 'Design', creatorId: admin.id, timeSlots: { create: { startTime: ost, endTime: oed, capacity: 5, remainingCapacity: 5 } } }, include: { timeSlots: true } });
  await prisma.booking.create({ data: { userId: sUsers[24].id, timeSlotId: s5a.timeSlots[0].id, spots: 1, status: BookingStatus.ACTIVE } });
  await prisma.booking.create({ data: { userId: sUsers[24].id, timeSlotId: s5b.timeSlots[0].id, spots: 1, status: BookingStatus.ACTIVE } });

  const bulkUsers = [];
  const userIds = [];
  for (let i = 0; i < 2000; i++) {
    const id = uuidv4();
    userIds.push(id);
    bulkUsers.push({ id, email: `bulk${i}@test.com`, name: `Load User ${i}`, passwordHash, role: Role.USER });
  }
  await prisma.user.createMany({ data: bulkUsers });

  const bulkEvents = [];
  const bulkSlots = [];
  const slotIds = [];
  const categories = ['Tech', 'Design', 'General', 'Workshop', 'Seminar'];
  
  for (let i = 0; i < 10000; i++) {
    const eId = uuidv4();
    const sId = uuidv4();
    slotIds.push(sId);
    bulkEvents.push({ id: eId, title: `Load Event ${i}`, description: 'Performance Test', location: 'Global', category: categories[i % 5], creatorId: admin.id });
    bulkSlots.push({ id: sId, eventId: eId, startTime: new Date(now.getTime() + (i * 10000)), endTime: new Date(now.getTime() + (i * 10000) + 3600000), capacity: 100, remainingCapacity: 95 });
  }
  
  for (let i = 0; i < bulkEvents.length; i += 2000) {
    await prisma.event.createMany({ data: bulkEvents.slice(i, i + 2000) });
    await prisma.timeSlot.createMany({ data: bulkSlots.slice(i, i + 2000) });
  }

  const bulkBookings = [];
  for (let u = 0; u < 2000; u++) {
    for (let b = 0; b < 25; b++) {
      bulkBookings.push({
        id: uuidv4(),
        userId: userIds[u],
        timeSlotId: slotIds[(u * 25 + b) % 10000],
        spots: 1,
        status: BookingStatus.ACTIVE
      });
    }
  }

  for (let i = 0; i < bulkBookings.length; i += 5000) {
    await prisma.booking.createMany({ data: bulkBookings.slice(i, i + 5000) });
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });