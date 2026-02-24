'use client';

import { useEffect, useState } from 'react';

export default function LocalTime({ utcDate, timezone }: { utcDate: Date | string, timezone?: string }) {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const date = new Date(utcDate);
    setDisplayTime(date.toLocaleString(undefined, {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, [utcDate, timezone]);

  return <span className="text-muted small">{displayTime}</span>;
}