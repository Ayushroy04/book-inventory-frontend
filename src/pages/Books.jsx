import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import '../styles/Books.css';

const GENRES = ['ALL', 'TECHNOLOGY', 'FICTION', 'EDUCATION', 'SCIENCE', 'HISTORY', 'BIOGRAPHY'];

export default function Books() {
    const [books, setBooks] = useState([]);
    const [genre, setGenre] = useState('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [wishlistMsg, setWishlistMsg] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // extract search from URL
    const queryParams = new URLSearchParams(location.search);
    const searchQueryFromUrl = queryParams.get('search') || '';


    useEffect(() => {
        setPage(0); // Reset page on search/genre change
    }, [searchQueryFromUrl, genre]);

    useEffect(() => {
        fetchBooks();
    }, [genre, page, searchQueryFromUrl]);


    const fetchBooks = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, size: 9 };
            if (genre !== 'ALL') params.genre = genre;
            if (searchQueryFromUrl) params.search = searchQueryFromUrl;
            const res = await api.get('/books', { params });

            setBooks(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
            setError('Cannot reach the server. Make sure your Spring Boot backend is running on port 8080.');
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (bookId) => {
        if (!user) { navigate('/login'); return; }
        try {
            await api.post(`/wishlist/books/${bookId}`);
            setWishlistMsg('Added to wishlist!');
            setTimeout(() => setWishlistMsg(''), 2000);
        } catch (err) {
            setWishlistMsg('Already in wishlist or error occurred.');
            setTimeout(() => setWishlistMsg(''), 2000);
        }
    };

    return (
        <div className="books-page">
            <div className="books-header">
                <div>
                    <h1>{searchQueryFromUrl ? `Results for "${searchQueryFromUrl}"` : 'Browse Books'}</h1>
                    {searchQueryFromUrl && (
                        <button className="btn-clear-search" onClick={() => navigate('/books')}>
                            ✕ Clear Search
                        </button>
                    )}
                </div>
                <div className="genre-filters">

                    {GENRES.map((g) => (
                        <button
                            key={g}
                            className={`genre-btn ${genre === g ? 'active' : ''}`}
                            onClick={() => { setGenre(g); setPage(0); }}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {wishlistMsg && <div className="toast">{wishlistMsg}</div>}

            {error && (
                <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="loading">Loading books...</div>
            ) : (
                <div className="books-grid">
                    {books.map((book) => (
                        <div
                            key={book.bookId}
                            className="book-card"
                            onClick={() => navigate(`/books/${book.bookId}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="book-genre-badge">{book.genre}</div>
                            <div className="book-icon">📖</div>
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">by {book.author}</p>
                            <div className="book-footer">
                                <span className="book-price">₹{book.price}</span>
                                {book.outOfStock ? (
                                    <span className="out-of-stock">Out of Stock</span>
                                ) : (
                                    <button
                                        className="btn-wishlist"
                                        onClick={(e) => { e.stopPropagation(); addToWishlist(book.bookId); }}
                                    >
                                        ♡ Wishlist
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
                <span>Page {page + 1} of {totalPages}</span>
                <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
        </div>
    );
}
