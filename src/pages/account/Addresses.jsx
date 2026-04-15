import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';

const EMPTY = { fullName:'', phone:'', addressLine1:'', addressLine2:'', city:'', state:'', postalCode:'', country:'', isDefault: false };

export default function Addresses() {
  const { user, updateUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing]     = useState(null); // null | 'new' | index
  const [form, setForm]           = useState(EMPTY);
  const [loading, setLoading]     = useState(false);

  // Load addresses from user profile
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : {})
      .then(data => setAddresses(Array.isArray(data.address) ? data.address : []))
      .catch(() => {});
  }, [user]);

  const saveToBackend = async (updated) => {
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username: user.username, email: user.email, phoneNumber: user.phoneNumber, avatarUrl: user.avatarUrl, address: updated }),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    let updated;
    if (editing === 'new') {
      updated = [...addresses, form];
    } else {
      updated = addresses.map((a, i) => i === editing ? form : a);
    }
    await saveToBackend(updated);
    setAddresses(updated);
    updateUser({ address: updated }); // ← keep context/localStorage in sync
    setEditing(null);
    setForm(EMPTY);
    setLoading(false);
  };

  const handleDelete = async (idx) => {
    const updated = addresses.filter((_, i) => i !== idx);
    await saveToBackend(updated);
    setAddresses(updated);
    updateUser({ address: updated });
  };

  const handleEdit = (idx) => { setForm(addresses[idx]); setEditing(idx); };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Addresses</h1>
        <p className="page-subtitle">Manage your saved delivery addresses.</p>
      </div>

      {editing !== null ? (
        <div className="glass-panel">
          <p className="section-label" style={{ marginBottom: 20 }}>{editing === 'new' ? 'Add New Address' : 'Edit Address'}</p>
          <div className="account-form">
            <div className="form-row">
              {['fullName','phone'].map(f => (
                <div className="form-group" key={f}>
                  <label>{f === 'fullName' ? 'Full Name' : 'Phone'}</label>
                  <input value={form[f]} onChange={e => setForm(p => ({...p, [f]: e.target.value}))} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Address Line 1</label>
              <input value={form.addressLine1} onChange={e => setForm(p => ({...p, addressLine1: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>Address Line 2 (optional)</label>
              <input value={form.addressLine2} onChange={e => setForm(p => ({...p, addressLine2: e.target.value}))} />
            </div>
            <div className="form-row">
              {['city','state','postalCode','country'].map(f => (
                <div className="form-group" key={f}>
                  <label>{f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                  <input value={form[f]} onChange={e => setForm(p => ({...p, [f]: e.target.value}))} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(p => ({...p, isDefault: e.target.checked}))} />
              <label htmlFor="isDefault" style={{ color:'#94a3b8', fontSize:'0.9rem', textTransform:'none', letterSpacing:'normal' }}>Set as default address</label>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving…' : 'Save Address'}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((addr, i) => (
            <div key={i} className={`address-card${addr.isDefault ? ' default' : ''}`}>
              {addr.isDefault && <span className="default-badge"><CheckCircle size={10} style={{marginRight:4,verticalAlign:'middle'}}/>Default</span>}
              <p style={{ color:'#e2e8f0', fontWeight:600, marginBottom:4 }}>{addr.fullName}</p>
              <p style={{ color:'#94a3b8', fontSize:'0.85rem', lineHeight:1.6 }}>
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br/>
                {addr.city}, {addr.state} {addr.postalCode}<br/>
                {addr.country}
              </p>
              <div className="address-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(i)}><Pencil size={13}/> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i)}><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
          <button className="add-address-card" onClick={() => { setForm(EMPTY); setEditing('new'); }}>
            <Plus size={24} /> Add New Address
          </button>
        </div>
      )}
    </div>
  );
}
