import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';

export default function Cart() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [updating, setUpdating] = useState(null); // bookId being updated

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchCart = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get(`/cart/${user.userId}`);
            setCart(res.data);
        } catch {
            showToast('Could not load cart.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchCart();
    }, [user, fetchCart, navigate]);

    const updateQty = async (bookId, newQty) => {
        if (newQty < 1) return;
        setUpdating(bookId);
        try {
            const res = await api.put(`/cart/${user.userId}/items`, { bookId, quantity: newQty });
            setCart(res.data);
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not update quantity.');
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (bookId) => {
        try {
            await api.delete(`/cart/${user.userId}/book/${bookId}`);
            setCart(prev => ({
                ...prev,
                items: prev.items.filter(i => i.bookId !== bookId),
            }));
            showToast('Item removed from cart.');
        } catch {
            showToast('Could not remove item.');
        }
    };

    if (loading) return <div className="loading">Loading cart...</div>;

    const items = cart?.items || [];
    const total = cart?.totalAmount ?? 0;

    return (
        <div className="cart-page">
            {toast && <div className="toast">{toast}</div>}

            <h1 className="cart-heading">My Cart</h1>

            {items.length === 0 ? (
                <div className="cart-empty">
                    <div className="cart-empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Browse our collection and add some books!</p>
                    <Link to="/books" className="btn-browse">Browse Books</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    {/* Items list */}
                    <div className="cart-items">
                        {items.map(item => (
                            <div key={item.bookId} className="cart-item">
                                {/* Cover */}
                                <div className="cart-item-cover">
                                    <span>📖</span>
                                </div>

                                {/* Info */}
                                <div className="cart-item-info">
                                    <h3 className="cart-item-title"
                                        onClick={() => navigate(`/books/${item.bookId}`)}
                                    >{item.title}</h3>
                                    <p className="cart-item-price">
                                        ₹{item.priceAtAdding?.toFixed(2)} each
                                    </p>

                                    <div className="cart-item-controls">
                                        <div className="qty-selector">
                                            <button
                                                onClick={() => updateQty(item.bookId, item.quantity - 1)}
                                                disabled={updating === item.bookId || item.quantity <= 1}
                                            >−</button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQty(item.bookId, item.quantity + 1)}
                                                disabled={updating === item.bookId}
                                            >+</button>
                                        </div>

                                        <button
                                            className="btn-remove"
                                            onClick={() => removeItem(item.bookId)}
                                        >🗑 Remove</button>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="cart-item-subtotal">
                                    ₹{item.subTotal?.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary panel */}
                    <div className="cart-summary">
                        <h2 className="summary-heading">Order Summary</h2>

                        <div className="summary-row">
                            <span>Items ({cart.totalItems})</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span style={{ color: '#10b981' }}>FREE</span>
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <button
                            className="btn-proceed"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Buy ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})
                        </button>

                        <Link to="/books" className="cart-continue-link">← Continue Shopping</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
