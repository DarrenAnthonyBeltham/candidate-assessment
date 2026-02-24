'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    startTime: '',
    endTime: '',
    capacity: 10,
  });

  if (status === 'loading') return <div className="p-4 text-center mt-5 text-muted small">Loading...</div>;
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="p-4 text-center mt-5 text-danger small fw-semibold">
        Access Denied. Only administrators can create events.
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/events');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4 animate-fade-in bg-white min-vh-100">
      <h2 className="fw-bolder mb-1">Create Event</h2>
      <p className="text-muted small mb-4">Host a new experience.</p>

      {error && <div className="alert alert-danger py-2 small rounded-3">{error}</div>}

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 pb-5">
        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">Event Title</label>
          <input required type="text" name="title" className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6" onChange={handleChange} />
        </div>

        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">Description</label>
          <textarea required name="description" rows={3} className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6" onChange={handleChange}></textarea>
        </div>

        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">Location</label>
          <input required type="text" name="location" className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6" onChange={handleChange} />
        </div>

        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">Category</label>
          <input type="text" name="category" placeholder="e.g., Workshop, Seminar" className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6" onChange={handleChange} />
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-semibold text-secondary mb-1">Start Time</label>
            <input required type="datetime-local" name="startTime" className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6 p-2" onChange={handleChange} />
          </div>
          <div className="col-6">
            <label className="form-label small fw-semibold text-secondary mb-1">End Time</label>
            <input required type="datetime-local" name="endTime" className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6 p-2" onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">Total Capacity</label>
          <input required type="number" name="capacity" min="1" defaultValue="10" className="form-control form-control-lg border-0 shadow-sm rounded-4 fs-6" onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading} className="btn btn-dark w-100 rounded-pill py-3 fw-bold mt-3 shadow-sm">
          {loading ? 'Publishing...' : 'Publish Event'}
        </button>
      </form>
    </div>
  );
}