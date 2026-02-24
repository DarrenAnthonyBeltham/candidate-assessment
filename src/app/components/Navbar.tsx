'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-bottom sticky-top z-3 w-100">
      <div className="d-flex justify-content-between align-items-center px-4 py-3">
        <Link 
          href="/events" 
          className="fw-bolder text-primary fs-4 text-decoration-none m-0" 
          onClick={() => setIsOpen(false)}
        >
          Event Hook
        </Link>
        
        <button 
          className="btn border-0 p-1 bg-transparent shadow-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="position-absolute top-100 start-0 w-100 bg-white border-bottom shadow-lg px-4 py-4 z-3">
          <div className="d-flex flex-column gap-3">
            {status === 'loading' ? (
              <div className="spinner-border spinner-border-sm text-primary mx-auto" role="status" />
            ) : session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="btn btn-light rounded-pill fw-bold py-2 text-dark w-100"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link 
                    href="/admin/recurring" 
                    className="btn btn-success rounded-pill fw-bold py-2 text-white w-100"
                    onClick={() => setIsOpen(false)}
                  >
                    + Create Event
                  </Link>
                )}
                <hr className="m-0 text-muted opacity-25" />
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="btn btn-danger rounded-pill fw-bold py-2 mt-1 w-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="btn btn-outline-primary rounded-pill fw-bold py-2 w-100"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="btn btn-primary rounded-pill fw-bold py-2 w-100"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}