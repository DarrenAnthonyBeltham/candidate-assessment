import prisma from '../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { redirect } from 'next/navigation';
import CancelButton from './CancelButton';
import NotificationCenter from './NotificationCenter';

export const dynamic = 'force-dynamic';

interface BookingDetail {
  id: string;
  spots: number;
  status: string;
  timeSlot: {
    startTime: Date;
    event: { title: string; location: string };
  };
}

interface WaitlistDetail {
  id: string;
  spots: number;
  status: string;
  timeSlot: {
    event: { title: string };
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [rawBookings, promotedWaitlist] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { timeSlot: { include: { event: true } } },
      orderBy: { timeSlot: { startTime: 'desc' } }
    }),
    prisma.waitlist.findMany({
      where: { 
        userId: session.user.id, 
        status: 'PROMOTED', 
        isRead: false 
      },
      include: { timeSlot: { include: { event: true } } }
    })
  ]);

  const notifications = (promotedWaitlist as unknown as WaitlistDetail[]).map(w => ({
    id: w.id,
    eventTitle: w.timeSlot.event.title,
    spots: w.spots
  }));

  const bookings = rawBookings as unknown as BookingDetail[];
  const now = new Date();
  
  const upcoming = bookings.filter((b) => b.timeSlot.startTime >= now && b.status === 'ACTIVE');
  const past = bookings.filter((b) => b.timeSlot.startTime < now || b.status === 'CANCELLED');

  return (
    <div className="container-fluid px-4 py-4 bg-white min-vh-100 pb-5">
      <h2 className="fw-bolder mb-4 text-dark">My Dashboard</h2>
      
      <NotificationCenter initialNotifications={notifications} />

      <div className="mb-5">
        <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Upcoming</h6>
        {upcoming.length === 0 ? (
          <div className="p-4 text-center rounded-4 border border-dashed text-muted small bg-light">
            No upcoming reservations
          </div>
        ) : (
          upcoming.map((b) => (
          <div key={b.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3 bg-light d-flex flex-row justify-content-between">
              <div>
                <div className="fw-bold text-dark">{b.timeSlot.event.title}</div>
                <div className="text-muted extra-small" suppressHydrationWarning>
                  {new Date(b.timeSlot.startTime).toLocaleString()}
                </div>
              </div>
              <CancelButton booking={b} /> 
            </div>
          ))
        )}
      </div>

      <div className="pb-4">
        <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{ letterSpacing: '1px' }}>History</h6>
        {past.map((b) => (
          <div key={b.id} className="py-3 border-bottom opacity-50 d-flex justify-content-between align-items-center">
            <span className="small fw-medium">{b.timeSlot.event.title}</span>
            <span className={`badge rounded-pill ${b.status === 'CANCELLED' ? 'bg-danger-subtle text-danger' : 'bg-light text-secondary'}`}>
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}