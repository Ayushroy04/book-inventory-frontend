import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield, Smartphone, Mail } from 'lucide-react';

export default function Security() {
  const { user } = useAuth();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [show, setShow]   = useState({ current: false, new: false, confirm: false });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [msg, setMsg]     = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (field) => setShow(p => ({ ...p, [field]: !p[field] }));

  const strength = (pwd) => {
    if (!pwd) return null;
    let s = 0;
    if (pwd.length > 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 25;
    if (s < 50) return { pct: 33, color: '#ef4444', label: 'Weak' };
    if (s < 100) return { pct: 66, color: '#fbbf24', label: 'Good' };
    return { pct: 100, color: '#34d399', label: 'Strong' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      setStatus('error'); setMsg('New passwords do not match.'); return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/password`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        setStatus('success'); setMsg('Password updated successfully!');
        setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        const text = await res.text();
        setStatus('error'); setMsg(text || 'Something went wrong.');
      }
    } catch {
      setStatus('error'); setMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const s = strength(form.newPassword);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Security</h1>
        <p className="page-subtitle">Manage your password and account security.</p>
      </div>

      <div className="security-grid">
        {/* Change Password */}
        <div className="glass-panel">
          <p className="section-label">Password</p>
          <p className="section-desc">Manage settings for your account passwords</p>

          <form className="account-form" onSubmit={handleSubmit}>
            {['currentPassword', 'newPassword', 'confirmNewPassword'].map((field, i) => {
              const labels = ['Current password', 'New password', 'Confirm new password'];
              const keys   = ['current', 'new', 'confirm'];
              return (
                <div className="form-group" key={field}>
                  <label>{labels[i]}</label>
                  <div className="input-with-icon">
                    <input
                      type={show[keys[i]] ? 'text' : 'password'}
                      name={field}
                      value={form[field]}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      required minLength={field === 'currentPassword' ? 1 : 8}
                    />
                    <button type="button" className="pw-toggle-btn" onClick={() => toggle(keys[i])}>
                      {show[keys[i]] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {field === 'newPassword' && s && (
                    <div className="pw-strength-meter">
                      <div className="pw-bar-container">
                        <div className="pw-bar-fill" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                      <span className="pw-label" style={{ color: s.color }}>{s.label}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {status && (
              <p style={{ color: status === 'success' ? '#34d399' : '#f87171', fontSize: '0.85rem' }}>{msg}</p>
            )}

            <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'flex-start' }}>
              <button type="button" className="btn btn-secondary" style={{ border: 'none' }}
                onClick={() => setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

        {/* 2FA + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel fade-in delay-1">
            <p className="section-label" style={{ marginBottom: 4 }}>Two-Factor Auth</p>
            <p className="section-desc">Add an extra layer of security to your account.</p>
            <div className="tfa-option">
              <Smartphone size={20} color="#38bdf8" />
              <div className="tfa-option-text"><h4>Authenticator App</h4><span>Not configured</span></div>
              <button className="btn btn-secondary btn-sm">Setup</button>
            </div>
          </div>
          <div className="glass-panel fade-in delay-2">
            <p className="section-label" style={{ marginBottom: 4 }}>Login Alerts</p>
            <p className="section-desc">Get notified on unrecognized logins.</p>
            <div className="toggle-row">
              <span>Email Notifications</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
