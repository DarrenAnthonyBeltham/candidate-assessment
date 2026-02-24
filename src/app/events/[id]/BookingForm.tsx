'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  timeSlotId: string;
  remaining: number;
  isFull: boolean;
}

export default function BookingForm({ timeSlotId, remaining, isFull }: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [spots, setSpots] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!session) return router.push('/login');
    setLoading(true);

    const res = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        userId: (session.user as any).id,
        timeSlotId,
        spots
      }),
    });

    if (res.ok) {
      router.refresh();
      alert(isFull ? 'Added to waitlist!' : 'Booking successful!');
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {!isFull && (
        <select 
          className="form-select form-select-sm w-auto rounded-3"
          value={spots}
          onChange={(e) => setSpots(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      )}
      <button
        onClick={handleBooking}
        disabled={loading}
        className={`btn btn-sm rounded-pill px-3 fw-bold ${isFull ? 'btn-outline-secondary' : 'btn-primary'}`}
      >
        {loading ? '...' : isFull ? 'Join Waitlist' : 'Book Now'}
      </button>
    </div>
  );
}