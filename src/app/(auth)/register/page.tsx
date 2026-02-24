'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      router.push('/events');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div className="container-fluid px-4 py-5 animate-fade-in d-flex flex-column justify-content-center min-vh-100">
      <div className="mb-5 text-center">
        <h2 className="fw-bolder mb-2">Create Account</h2>
        <p className="text-muted small">Join to start booking events.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary">Full Name</label>
          <input
            type="text"
            className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
          Sign Up
        </button>
      </form>

      <div className="text-center mt-3">
        <span className="text-muted small">Already have an account? </span>
        <Link href="/login" className="text-primary fw-semibold small text-decoration-none">
          Sign In
        </Link>
      </div>
    </div>
  );
}