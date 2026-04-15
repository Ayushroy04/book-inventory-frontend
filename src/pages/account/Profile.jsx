import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your personal information.</p>
      </div>

      {/* Avatar */}
      <div className="glass-panel" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(99,102,241,0.4)', overflow: 'hidden', flexShrink: 0 }}>
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          ) : (
            <User size={32} color="#818cf8" />
          )}
        </div>
        <div>
          <h3 style={{ color: '#f1f5f9', fontWeight: 600 }}>{form.username || 'Your Name'}</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{form.email}</p>
        </div>
      </div>

      <div className="glass-panel">
        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className="form-actions">
            {saved && <span style={{ color: '#34d399', fontSize: '0.85rem', alignSelf: 'center' }}>✓ Saved!</span>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
