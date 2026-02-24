'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AuthSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem('user_name', session.user.name || '');
      localStorage.setItem('is_logged_in', 'true');
    } else {
      localStorage.removeItem('user_name');
      localStorage.removeItem('is_logged_in');
    }
  }, [session]);

  return null; 
}