import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

// Client-side password rules (mirrors backend @ValidPassword)
function validatePassword(password) {
    if (!password || password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one digit (0-9)';
    if (!/[@$!%*?&]/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return null; // valid
}

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', phoneNumber: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation first — gives immediate feedback without a round-trip
        const pwdError = validatePassword(form.password);
        if (pwdError) {
            setError(pwdError);
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/register', form);
            login({ userId: res.data.userId, email: res.data.email, role: res.data.role }, res.data.token);
            navigate('/books');
        } catch (err) {
            const data = err.response?.data;
            if (data?.validationErrors) {
                // Backend returned field-level validation errors — show them cleanly
                const messages = Object.values(data.validationErrors).join('; ');
                setError(messages || 'Validation failed. Please check your inputs.');
            } else if (data?.message) {
                setError(data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="auth-brand-logo">📚</div>
                <h1 className="auth-brand-title">
                    Join a community<br />of <span>book lovers.</span>
                </h1>
                <p className="auth-brand-desc">
                    Create your free account in seconds and start exploring thousands of books curated just for you.
                </p>
                <div className="auth-features">
                    <div className="auth-feature"><div className="auth-feature-icon">🚀</div>Free account, instant access</div>
                    <div className="auth-feature"><div className="auth-feature-icon">🔒</div>Secure &amp; encrypted data</div>
                    <div className="auth-feature"><div className="auth-feature-icon">📧</div>Order updates via email</div>
                    <div className="auth-feature"><div className="auth-feature-icon">🎁</div>Personalised recommendations</div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <h2 className="auth-title">Create account</h2>
                    <p className="auth-subtitle">Start your reading journey today</p>

                    {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" placeholder="john_doe" value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="you@example.com" value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" placeholder="+91 98765 43210" value={form.phoneNumber}
                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 symbol"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button type="button" className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small style={{ color: '#888', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                Must be 8+ chars with uppercase, lowercase, digit &amp; special char (@$!%*?&amp;)
                            </small>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
