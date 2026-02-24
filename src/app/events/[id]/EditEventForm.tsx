'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventForm({ event }: { event: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    category: event.category
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.refresh();
      alert('Changes saved successfully!');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event permanently?')) return;
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/events');
  };

  return (
    <form onSubmit={handleUpdate} className="d-flex flex-column gap-3 animate-slide-up">
      <div className="bg-light rounded-4 p-3">
        <label className="extra-small fw-bold text-muted text-uppercase mb-1 d-block">Title</label>
        <input 
          className="form-control border-0 bg-transparent p-0 fw-bold" 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
        />
      </div>

      <div className="bg-light rounded-4 p-3">
        <label className="extra-small fw-bold text-muted text-uppercase mb-1 d-block">Description</label>
        <textarea 
          className="form-control border-0 bg-transparent p-0 small" 
          rows={3} 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
        />
      </div>

      <div className="bg-light rounded-4 p-3">
        <label className="extra-small fw-bold text-muted text-uppercase mb-1 d-block">Location</label>
        <input 
          className="form-control border-0 bg-transparent p-0 small" 
          value={formData.location} 
          onChange={(e) => setFormData({...formData, location: e.target.value})} 
        />
      </div>

      <div className="d-flex gap-2 mt-2">
        <button type="submit" disabled={loading} className="btn btn-dark rounded-pill grow py-3 fw-bold shadow-sm">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button 
          type="button" 
          onClick={handleDelete} 
          className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: '56px', height: '56px' }}
        >
          <span className="fs-5">✕</span>
        </button>
      </div>
    </form>
  );
}