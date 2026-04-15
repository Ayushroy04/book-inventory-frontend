import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import api from '../api/axios';
import '../styles/Navbar.css';
import logo from '../assets/booklogo.png';


export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    // Sync search input with URL
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    // Close menu on route change
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        if (!user) { setCartCount(0); return; }
        api.get(`/cart/${user.userId}`)
            .then(res => setCartCount(res.data.totalItems ?? 0))
            .catch(() => { });
    }, [user]);

    // Live Search: Debounced navigation
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentQuery = new URLSearchParams(location.search).get('search') || '';
            if (searchQuery.trim() === currentQuery.trim()) return;

            if (searchQuery.trim()) {
                navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
            } else if (location.pathname === '/books' && currentQuery) {
                navigate('/books');
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery, navigate, location.pathname]);


    // Update input if URL changes
    useEffect(() => {
        const q = new URLSearchParams(location.search).get('search') || '';
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [location.search]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };


    return (
        <nav className="navbar">
            <Link to="/books" className="navbar-brand">
                <img src={logo} alt="BookStore Logo" className="brand-logo" />
                BookStore
            </Link>

            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search by title, author, or genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">🔍</button>
            </form>

            {/* Desktop nav */}
            <div className="navbar-links">
                <Link to="/books">Browse</Link>
                {user && <Link to="/wishlist">Wishlist</Link>}
                {user && (
                    <Link to="/cart" className="cart-nav-link">
                        Cart
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                )}
                {user && <Link to="/orders">My Orders</Link>}
                {isAdmin && <Link to="/admin">Admin</Link>}
            </div>

            <div className="navbar-auth">
                {user ? (
                    <>
                        <Link to="/my-account" className="navbar-my-account">My Account</Link>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-nav-outline">Login</Link>
                        <Link to="/register" className="btn-nav-primary">Register</Link>
                    </>
                )}
            </div>

            {/* Hamburger button — mobile only */}
            <button
                className="navbar-hamburger"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
            >
                <span className={`ham-bar${menuOpen ? ' open' : ''}`} />
                <span className={`ham-bar${menuOpen ? ' open' : ''}`} />
                <span className={`ham-bar${menuOpen ? ' open' : ''}`} />
            </button>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/books" onClick={() => setMenuOpen(false)}>Browse</Link>
                    {user && <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>}
                    {user && (
                        <Link to="/cart" onClick={() => setMenuOpen(false)}>
                            Cart {cartCount > 0 && <span className="cart-badge-inline">{cartCount}</span>}
                        </Link>
                    )}
                    {user && <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>}
                    {user && <Link to="/my-account" onClick={() => setMenuOpen(false)}>My Account</Link>}
                    {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
                    {user ? (
                        <button className="mobile-logout" onClick={handleLogout}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
