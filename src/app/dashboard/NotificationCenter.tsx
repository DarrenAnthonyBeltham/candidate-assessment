'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  eventTitle: string;
  spots: number;
}

export default function NotificationCenter({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const markAsRead = async (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    await fetch(`/api/waitlist/${id}/read`, { method: 'PATCH' });
    router.refresh();
  };

  if (notifications.length === 0) return null;

  return (
    <div className="mb-4 animate-fade-in">
      <h6 className="fw-bold text-uppercase small text-primary mb-3" style={{ letterSpacing: '1px' }}>
        Notifications
      </h6>
      {notifications.map((n) => (
        <div key={n.id} className="alert alert-primary border-0 shadow-sm rounded-4 px-4 py-3 d-flex justify-content-between align-items-center mb-2">
          <div className="small">
            <span className="fw-bold">Good news!</span> You were promoted to the <span className="fw-bold">{n.eventTitle}</span> for {n.spots} {n.spots === 1 ? 'spot' : 'spots'}.
          </div>
          <button 
            onClick={() => markAsRead(n.id)}
            className="btn btn-sm p-0 ms-3 text-primary opacity-75"
            style={{ fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}