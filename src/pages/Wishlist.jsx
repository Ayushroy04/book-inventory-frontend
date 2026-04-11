import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/Wishlist.css';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchWishlist(); }, []);

    const fetchWishlist = async () => {
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeBook = async (bookId) => {
        try {
            const res = await api.delete(`/wishlist/books/${bookId}`);
            setWishlist(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading wishlist...</div>;

    return (
        <div className="wishlist-page">
            <h1>My Wishlist</h1>
            {!wishlist?.books?.length ? (
                <div className="empty-state">
                    <p>💔 Your wishlist is empty.</p>
                    <a href="/books">Browse books to add some!</a>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.books.map((book) => (
                        <div key={book.bookId} className="wishlist-card">
                            <div className="book-icon">📖</div>
                            <div className="wishlist-info">
                                <h3>{book.title}</h3>
                                <p>by {book.author}</p>
                                <span className="genre-tag">{book.genre}</span>
                                <p className="book-price">₹{book.price}</p>
                                {book.outOfStock && <span className="out-of-stock">Out of Stock</span>}
                            </div>
                            <button className="btn-remove" onClick={() => removeBook(book.bookId)}>✕</button>
                        </div>
                    ))}
                </div>
            )}
            <p className="wishlist-count">{wishlist?.totalItems || 0} item(s) in wishlist</p>
        </div>
    );
}
