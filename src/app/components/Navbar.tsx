'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3 sticky-top">
      <div className="container-fluid">
        <Link href="/events" className="navbar-brand fw-bolder text-primary fs-4">
          Event Hook
        </Link>
        
        <div className="d-flex align-items-center gap-3">
          {status === 'loading' ? (
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : session ? (
            <>
              <Link href="/dashboard" className="text-dark text-decoration-none small fw-bold">
                Dashboard
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}