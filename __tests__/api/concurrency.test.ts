import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

describe('Layer 3.1: Concurrent Booking Protection', () => {
  test('Simultaneous booking for last spot - only one succeeds', async () => {
    const bookingPayload = {
      userId: 'test-user-id',
      timeSlotId: 'slot-with-1-spot-left',
      spots: 1
    };

    const [res1, res2] = await Promise.all([
      request('http://localhost:3000').post('/api/bookings').send(bookingPayload),
      request('http://localhost:3000').post('/api/bookings').send(bookingPayload)
    ]);

    const statuses = [res1.status, res2.status];
    
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);
  });
});