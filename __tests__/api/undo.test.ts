import request from 'supertest';

describe('Layer 3.2: Undo Cancellation Edge Case', () => {
  test('Undo should fail if spots were filled by waitlist auto-promotion', async () => {
    const bookingId = 'cancelled-booking-id';
    
    const response = await request('http://localhost:3000')
      .post(`/api/bookings/${bookingId}/undo`)
      .send();

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/Spots were taken/);
  });
});