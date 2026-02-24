export function validateBookingConflict(newSlot: { startTime: Date; endTime: Date }, existingSlots: any[]) {
  return existingSlots.some(slot => {
    const existingStart = new Date(slot.startTime);
    const existingEnd = new Date(slot.endTime);
    return newSlot.startTime < existingEnd && newSlot.endTime > existingStart;
  });
}