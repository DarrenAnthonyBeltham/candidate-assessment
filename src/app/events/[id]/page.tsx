import prisma from '@/app/lib/db';
import LocalTime from '../../components/LocalTime';
import BookingForm from './BookingForm';
import { notFound } from 'next/navigation';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { 
      timeSlots: true,
      creator: true 
    }
  });

  if (!event) notFound();

  return (
    <div className="p-3 pb-5">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h1 className="h4 fw-bold m-0">{event.title}</h1>
        {event.isRecurring && (
          <span className="badge rounded-pill bg-info-subtle text-info border border-info small">
            Series
          </span>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-light">
        <div className="d-flex flex-column gap-2">
          <div className="small text-muted">Category: <span className="text-dark fw-bold">{event.category}</span></div>
          <div className="small text-muted">Location: <span className="text-dark fw-bold">{event.location}</span></div>
          <div className="small text-muted">Host: <span className="text-dark fw-bold">{event.creator.name}</span></div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="h6 fw-bold mb-2">Available Slots</h3>
        {event.timeSlots.map((slot) => (
          <div key={slot.id} className="card border-0 shadow-sm rounded-4 p-3 mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <LocalTime utcDate={slot.startTime} />
                <div className="extra-small text-muted">
                  {slot.remainingCapacity} spots left of {slot.capacity}
                </div>
              </div>
              <BookingForm 
                timeSlotId={slot.id} 
                remaining={slot.remainingCapacity} 
                isFull={slot.remainingCapacity === 0}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <h3 className="h6 fw-bold">Description</h3>
        <p className="text-muted small">{event.description}</p>
      </div>
    </div>
  );
}