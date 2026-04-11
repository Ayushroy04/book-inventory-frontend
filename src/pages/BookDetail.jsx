import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/BookDetail.css';

// Dynamically load the Razorpay checkout script
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}


export default function BookDetail() {
    const { bookId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [buying, setBuying] = useState(false);
    const [cartBookIds, setCartBookIds] = useState(new Set());
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        fetchAll();
    }, [bookId]);

    const fetchAll = async () => {
        try {
            const [bookRes, reviewsRes, ratingRes] = await Promise.all([
                api.get(`/books/${bookId}`),
                api.get(`/books/${bookId}/reviews`),
                api.get(`/books/${bookId}/rating`),
            ]);
            setBook(bookRes.data);
            setReviews(reviewsRes.data);
            setRating(ratingRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        // Load cart state if logged in
        if (user) {
            try {
                const cartRes = await api.get(`/cart/${user.userId}`);
                const ids = new Set((cartRes.data.items || []).map(i => i.bookId));
                setCartBookIds(ids);
            } catch { /* ignore */ }
        }
    };

    const addToWishlist = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            await api.post(`/wishlist/books/${bookId}`);
            showToast('Added to wishlist! ❤️');
        } catch (err) {
            if (err.response?.status === 409 || err.response?.status === 400) {
                showToast('Already in your wishlist ❤️');
            } else {
                showToast('Could not add to wishlist.');
            }
        }
    };

    const addToCart = async () => {
        if (!user) { navigate('/login'); return; }
        if (cartBookIds.has(bookId)) {
            showToast('Already in your cart 🛒');
            return;
        }
        setAddingToCart(true);
        try {
            await api.post(`/cart/${user.userId}/items`, { bookId, quantity });
            setCartBookIds(prev => new Set([...prev, bookId]));
            showToast('Added to cart! 🛒');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not add to cart.');
        } finally {
            setAddingToCart(false);
        }
    };

    const buyNow = async () => {
        if (!user) { navigate('/login'); return; }
        setBuying(true);
        try {
            // Amount in paise (₹1 = 100 paise)
            const amountInPaise = Math.round(book.price * quantity * 100);

            // Step 1 — Create a Razorpay order on the backend
            const orderRes = await api.post('/payment/create-order', {
                userId: user.userId,
                amount: amountInPaise,
            });

            const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

            // Step 2 — Ensure Razorpay script is loaded
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                showToast('Could not load payment gateway. Check your internet connection.');
                setBuying(false);
                return;
            }

            // Step 3 — Open the Razorpay checkout popup
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'BookStore',
                description: `Direct Purchase: ${book.title}`,
                order_id: razorpayOrderId,
                prefill: {
                    email: user.email,
                },
                theme: { color: '#6366f1' },

                // Step 4 — On payment success, verify on backend
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/payment/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            userId: user.userId,
                            bookId: book.bookId,   // Pass bookId for single purchase
                            quantity: quantity     // Pass quantity for single purchase
                        });
                        showToast(`Payment successful! 🎉 Confirmation email sent.`);
                        setTimeout(() => navigate('/orders'), 2000);
                    } catch (err) {
                        showToast(err.response?.data?.message || 'Payment verification failed. Contact support.');
                        setBuying(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        showToast('Payment cancelled.');
                        setBuying(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                showToast(`Payment failed: ${response.error.description}`);
                setBuying(false);
            });
            rzp.open();

        } catch (err) {
            showToast(err.response?.data?.message || 'Could not initiate payment. Try again.');
            setBuying(false);
        }
    };


    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        setSubmitting(true);
        try {
            await api.post(`/books/${bookId}/reviews`, reviewForm);
            setReviewForm({ rating: 5, comment: '' });
            fetchAll();
            showToast('Review submitted! ⭐');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    if (loading) return <div className="loading">Loading book...</div>;
    if (!book) return <div className="loading">Book not found.</div>;

    return (
        <div className="book-detail-page">
            {toast && <div className="toast">{toast}</div>}

            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <div className="book-detail-hero">
                <div className="book-detail-cover">
                    <span className="cover-emoji">📖</span>
                    <span className="cover-genre">{book.genre}</span>
                </div>
                <div className="book-detail-info">
                    <h1 className="book-detail-title">{book.title}</h1>
                    <p className="book-detail-author">by <strong>{book.author}</strong></p>

                    {rating && (
                        <div className="book-rating">
                            <span className="stars">{'★'.repeat(Math.round(rating.averageRating))}{'☆'.repeat(5 - Math.round(rating.averageRating))}</span>
                            <span className="rating-value">{rating.averageRating?.toFixed(1)}</span>
                            <span className="rating-count">({rating.totalReviews} reviews)</span>
                        </div>
                    )}

                    <div className="book-meta">
                        <div className="meta-item"><span className="meta-label">ISBN</span><span>{book.isbn}</span></div>
                        <div className="meta-item"><span className="meta-label">Genre</span><span>{book.genre}</span></div>
                        <div className="meta-item">
                            <span className="meta-label">Stock</span>
                            <span style={{ color: book.outOfStock ? '#ef4444' : '#10b981' }}>
                                {book.outOfStock ? 'Out of stock' : (book.stockMessage || 'In stock')}
                            </span>
                        </div>
                    </div>

                    {book.description && (
                        <div className="book-description">
                            <h3 className="desc-heading">About this book</h3>
                            <p className="desc-text">{book.description}</p>
                        </div>
                    )}

                    <div className="book-detail-actions">
                        <span className="detail-price">₹{(book.price * quantity).toFixed(2)}</span>
                        <div className="qty-selector">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                        <button className="btn-buy-now" onClick={buyNow} disabled={buying || book.outOfStock}>
                            {buying ? 'Placing...' : '🛒 Buy Now'}
                        </button>
                        <button
                            className={`btn-add-cart ${cartBookIds.has(bookId) ? 'in-cart' : ''}`}
                            onClick={addToCart}
                            disabled={addingToCart || book.outOfStock}
                        >
                            {addingToCart ? 'Adding...' : cartBookIds.has(bookId) ? '✓ In Cart' : '+ Cart'}
                        </button>
                        <button className="btn-add-wishlist" onClick={addToWishlist}>❤️ Wishlist</button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
                <h2>Reviews</h2>

                {user && (
                    <form onSubmit={submitReview} className="review-form">
                        <h3>Write a Review</h3>
                        <div className="rating-selector">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`star-btn ${reviewForm.rating >= n ? 'active' : ''}`}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                                >★</button>
                            ))}
                            <span>{reviewForm.rating}/5</span>
                        </div>
                        <textarea
                            placeholder="Share your thoughts about this book..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows={3}
                        />
                        <button type="submit" className="btn-submit-review" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}

                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                    ) : reviews.map((review) => (
                        <div key={review.reviewId} className="review-card">
                            <div className="review-header">
                                <span className="review-username">{review.username || 'Anonymous'}</span>
                                <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>

                            {review.comment && <p className="review-comment">{review.comment}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

