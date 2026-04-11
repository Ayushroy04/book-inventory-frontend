import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', form);
            login({ userId: res.data.userId, email: res.data.email, role: res.data.role }, res.data.token);
            navigate('/books');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="auth-brand-logo">📚</div>
                <h1 className="auth-brand-title">
                    Your next great<br />
                    <span>read awaits.</span>
                </h1>
                <p className="auth-brand-desc">
                    Explore thousands of books, build your wishlist, and track your orders — all in one beautiful place.
                </p>
                <div className="auth-features">
                    <div className="auth-feature"><div className="auth-feature-icon">🔍</div>Browse by genre, author, and more</div>
                    <div className="auth-feature"><div className="auth-feature-icon">❤️</div>Save favourites to your wishlist</div>
                    <div className="auth-feature"><div className="auth-feature-icon">📦</div>Real-time order tracking</div>
                    <div className="auth-feature"><div className="auth-feature-icon">⭐</div>Rate and review your reads</div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <h2 className="auth-title">Welcome back</h2>
                    <p className="auth-subtitle">Sign in to continue to BookStore</p>

                    {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/register">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
