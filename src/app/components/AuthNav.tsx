'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="spinner-border spinner-border-sm text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Link href="/dashboard" className="text-decoration-none small fw-bold text-dark me-2">
          Dashboard
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: '/events' })} 
          className="btn btn-sm btn-outline-danger rounded-pill fw-bold px-3"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex gap-2">
      <Link href="/login" className="btn btn-sm btn-outline-primary rounded-pill fw-bold px-3">
        Login
      </Link>
      <Link href="/register" className="btn btn-sm btn-primary rounded-pill fw-bold px-3">
        Register
      </Link>
    </div>
  );
}