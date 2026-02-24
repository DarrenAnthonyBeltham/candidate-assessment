'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelButton({ booking }: { booking: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isCancelled = booking.status === 'CANCELLED';

  const handleAction = async () => {
    setLoading(true);
    const endpoint = isCancelled ? `/api/bookings/${booking.id}/undo` : `/api/bookings/${booking.id}`;
    const method = isCancelled ? 'POST' : 'DELETE';

    try {
      const res = await fetch(endpoint, { method });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAction}
      disabled={loading}
      className={`btn btn-sm rounded-pill px-3 fw-bold ${isCancelled ? 'btn-outline-primary' : 'btn-light text-danger'}`}
    >
      {loading ? '...' : isCancelled ? 'Reclaim Spot' : 'Cancel'}
    </button>
  );
}