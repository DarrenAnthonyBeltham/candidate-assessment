'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', category: '' });

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          title: data.title,
          description: data.description,
          location: data.location,
          category: data.category
        });
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch(`/api/events/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) router.push(`/events/${params.id}`);
    else alert('Failed to update event');
    setLoading(false);
  };

  if ((session?.user as any)?.role !== 'ADMIN') return null;

  return (
    <div className="p-3">
      <h2 className="h5 fw-bold mb-3">Edit Event</h2>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <input 
          className="form-control rounded-3" 
          value={form.title} 
          onChange={e => setForm({...form, title: e.target.value})} 
          required 
        />
        <input 
          className="form-control rounded-3" 
          value={form.category} 
          onChange={e => setForm({...form, category: e.target.value})} 
          required 
        />
        <input 
          className="form-control rounded-3" 
          value={form.location} 
          onChange={e => setForm({...form, location: e.target.value})} 
          required 
        />
        <textarea 
          className="form-control rounded-3" 
          rows={5}
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          required 
        />
        <button type="submit" disabled={loading} className="btn btn-primary rounded-pill fw-bold mt-2">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}