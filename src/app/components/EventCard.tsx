import Link from 'next/link';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  remainingCapacity: number;
}

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    timeSlots: TimeSlot[];
  };
  delay?: number;
}

export default function EventCard({ event, delay = 0 }: EventCardProps) {
  const totalRemaining = event.timeSlots.reduce((acc, slot) => acc + slot.remainingCapacity, 0);
  const isSoldOut = totalRemaining === 0;

  return (
    <div 
      className="card border-0 shadow-sm mb-3 event-card-hover animate-slide-up rounded-4"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-light text-primary border border-primary-subtle rounded-pill px-3 py-2">
            {event.category}
          </span>
          <span className={`badge rounded-pill px-3 py-2 ${isSoldOut ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
            {isSoldOut ? 'Waitlist Only' : `${totalRemaining} Spots Left`}
          </span>
        </div>
        
        <h5 className="card-title fw-bold mt-3 mb-1">{event.title}</h5>
        <p className="card-text text-muted small mb-3 text-truncate">
          {event.description}
        </p>
        
        <div className="d-flex align-items-center mb-4 text-secondary small">
          <i className="bi bi-geo-alt-fill me-2"></i>
          {event.location}
        </div>

        <Link href={`/events/${event.id}`} className="btn btn-dark w-100 rounded-pill py-2 fw-semibold">
          View Time Slots
        </Link>
      </div>
    </div>
  );
}