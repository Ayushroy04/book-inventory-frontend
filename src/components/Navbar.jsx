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

    // Sync search input with URL
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);

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
                // Clear search if input is empty and we were searching
                navigate('/books');
            }
        }, 350); // 350ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, navigate, location.pathname]);


    // Update input if URL changes (e.g. clicking 'Clear Search')
    useEffect(() => {
        const q = new URLSearchParams(location.search).get('search') || '';
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [location.search]);

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                        <Link to="/my-account" className="navbar-email">My Account</Link>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-nav-outline">Login</Link>
                        <Link to="/register" className="btn-nav-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
