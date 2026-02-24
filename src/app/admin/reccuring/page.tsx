'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRecurringEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Workshop',
    startTime: '',
    endTime: '',
    capacity: '10',
    frequency: 'WEEKLY',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/events/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) router.push('/events');
    else alert('Failed to create series');
    setLoading(false);
  };

  return (
    <div className="p-3">
      <h2 className="h5 fw-bold mb-3">Create Recurring Series</h2>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <input className="form-control rounded-3" placeholder="Title" required
          onChange={e => setForm({...form, title: e.target.value})} />
        
        <div className="row g-2">
          <div className="col-6">
            <select className="form-select rounded-3" 
              onChange={e => setForm({...form, frequency: e.target.value})}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="col-6">
            <input type="date" className="form-control rounded-3" required
              onChange={e => setForm({...form, endDate: e.target.value})} />
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label className="extra-small text-muted">First Start</label>
            <input type="datetime-local" className="form-control rounded-3" required
              onChange={e => setForm({...form, startTime: e.target.value})} />
          </div>
          <div className="col-6">
            <label className="extra-small text-muted">First End</label>
            <input type="datetime-local" className="form-control rounded-3" required
              onChange={e => setForm({...form, endTime: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary rounded-pill fw-bold">
          {loading ? 'Creating...' : 'Generate Series'}
        </button>
      </form>
    </div>
  );
}