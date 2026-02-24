import Link from 'next/link';
import prisma from '@/app/lib/db';
import LocalTime from '../components/LocalTime';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const take = 20;
  const skip = (page - 1) * take;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      take,
      skip,
      include: { timeSlots: { orderBy: { startTime: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.event.count(),
  ]);

  const totalPages = Math.ceil(total / take);

  return (
    <div className="p-3">
      <h2 className="fw-bold mb-3 h4">Explore Events</h2>
      
      <div className="row g-2">
        {events.map((event) => (
          <div key={event.id} className="col-6">
            <Link href={`/events/${event.id}`} className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="bg-primary-subtle p-3 text-center" style={{ height: '80px' }}>
                  <span className="badge bg-primary rounded-pill">{event.category}</span>
                </div>
                <div className="p-2">
                  <div className="fw-bold text-dark small text-truncate">{event.title}</div>
                  <div className="text-muted extra-small">
                    <LocalTime utcDate={event.timeSlots[0]?.startTime} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center align-items-center gap-3 mt-4 pb-5">
        {page > 1 ? (
          <Link href={`/events?page=${page - 1}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
            Prev
          </Link>
        ) : (
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold" disabled>Prev</button>
        )}
        
        <span className="small text-muted fw-bold">
          Page {page} of {totalPages}
        </span>

        {page < totalPages ? (
          <Link href={`/events?page=${page + 1}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">
            Next
          </Link>
        ) : (
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold" disabled>Next</button>
        )}
      </div>
    </div>
  );
}