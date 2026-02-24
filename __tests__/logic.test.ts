import { validateBookingConflict } from '../src/app/lib/booking-utils';

describe('Layer 2.4 & 3.1: Booking Logic', () => {
  const existingSlots = [
    { startTime: new Date('2026-03-01T10:00:00Z'), endTime: new Date('2026-03-01T11:00:00Z') }
  ];

  test('Should detect overlapping time slots (Conflict Detection)', () => {
    const newSlot = { startTime: new Date('2026-03-01T10:30:00Z'), endTime: new Date('2026-03-01T11:30:00Z') };
    const hasConflict = validateBookingConflict(newSlot, existingSlots);
    expect(hasConflict).toBe(true);
  });

  test('Should allow adjacent time slots (Non-conflicting)', () => {
    const newSlot = { startTime: new Date('2026-03-01T11:00:00Z'), endTime: new Date('2026-03-01T12:00:00Z') };
    const hasConflict = validateBookingConflict(newSlot, existingSlots);
    expect(hasConflict).toBe(false);
  });
});