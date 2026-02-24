'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/events');
      router.refresh();
    }
  };

  return (
    <div className="container-fluid px-4 py-5 animate-fade-in d-flex flex-column justify-content-center min-vh-100">
      <div className="mb-5 text-center">
        <h2 className="fw-bolder mb-2">Welcome Back</h2>
        <p className="text-muted small">Sign in to manage your bookings.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary">Email</label>
          <input
            type="email"
            className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold text-secondary">Password</label>
          <input
            type="password"
            className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-dark w-100 rounded-pill py-3 fw-semibold mb-3">
          Sign In
        </button>
      </form>

      <div className="text-center mt-3">
        <span className="text-muted small">Don't have an account? </span>
        <Link href="/register" className="text-primary fw-semibold small text-decoration-none">
          Sign Up
        </Link>
      </div>
    </div>
  );
}