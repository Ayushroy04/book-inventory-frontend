import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Checkout.css';

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) { resolve(true); return; }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function Checkout() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: '' });

    const showToast = (msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 4500);
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        api.get(`/cart/${user.userId}`)
            .then(res => setCart(res.data))
            .catch(() => showToast('Could not load cart.', 'error'))
            .finally(() => setLoading(false));
        loadRazorpayScript();
    }, [user, navigate]);

    const handlePayment = async () => {
        if (!cart?.items?.length) return;
        setPaying(true);

        try {
            const amountInPaise = Math.round(cart.totalAmount * 100);
            const orderRes = await api.post('/payment/create-order', {
                userId: user.userId,
                amount: amountInPaise,
            });

            const { razorpayOrderId, amount, currency, keyId } = orderRes.data;
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                showToast('Could not load payment gateway. Check your internet connection.', 'error');
                setPaying(false);
                return;
            }

            const options = {
                key: keyId,
                amount,
                currency,
                name: 'BookStore',
                description: `Order for ${cart.totalItems} book(s)`,
                order_id: razorpayOrderId,
                prefill: { email: user.email },
                theme: { color: '#6366f1' },
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/payment/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            userId: user.userId,
                        });
                        showToast(`Payment successful! 🎉 Order #${verifyRes.data.orderId?.slice(0, 8).toUpperCase()} placed.`, 'success');
                        setTimeout(() => navigate('/orders'), 2200);
                    } catch (err) {
                        showToast(err.response?.data?.message || 'Payment verification failed. Contact support.', 'error');
                        setPaying(false);
                    }
                },
                modal: { ondismiss: () => { showToast('Payment cancelled.', 'info'); setPaying(false); } },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                showToast(`Payment failed: ${response.error.description}`, 'error');
                setPaying(false);
            });
            rzp.open();

        } catch (err) {
            showToast(err.response?.data?.message || 'Could not initiate payment. Try again.', 'error');
            setPaying(false);
        }
    };

    if (loading) return <div className="loading">Loading checkout...</div>;

    const items = cart?.items || [];
    const total = cart?.totalAmount ?? 0;

    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="cart-empty" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <h2 style={{ color: '#e2e8f0' }}>No items to checkout</h2>
                    <button className="btn-back-to-cart" onClick={() => navigate('/books')}>Browse Books</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {toast.msg && (
                <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
            )}

            <div className="checkout-header">
                <button className="back-btn" onClick={() => navigate('/cart')}>← Back to Cart</button>
                <h1 className="checkout-title">Checkout</h1>
            </div>

            <div className="checkout-layout">
                <div className="checkout-items">
                    <h2 className="section-heading">Order Summary</h2>
                    {items.map(item => (
                        <div key={item.bookId} className="checkout-item">
                            <div className="checkout-item-cover">📖</div>
                            <div className="checkout-item-info">
                                <p className="checkout-item-title">{item.title}</p>
                                <p className="checkout-item-meta">Qty: {item.quantity} × ₹{item.priceAtAdding?.toFixed(2)}</p>
                            </div>
                            <div className="checkout-item-sub">₹{item.subTotal?.toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                <div className="checkout-panel">
                    <h2 className="section-heading">Payment Details</h2>

                    <div className="mock-notice" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.08)' }}>
                        <span>🔒</span>
                        <span>Secured by <strong>Razorpay</strong> — UPI, Cards, Net Banking &amp; more</span>
                    </div>

                    <div className="checkout-summary-row">
                        <span>Subtotal ({cart.totalItems} items)</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="checkout-summary-row">
                        <span>Delivery</span>
                        <span style={{ color: '#10b981' }}>FREE</span>
                    </div>
                    <div className="checkout-divider" />
                    <div className="checkout-total">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>

                    <button className="btn-place-order" onClick={handlePayment} disabled={paying}>
                        {paying ? 'Processing...' : `💳 Pay ₹${total.toFixed(2)}`}
                    </button>

                    <p className="checkout-fine-print">
                        A confirmation email will be sent to <strong>{user?.email}</strong> after payment.
                    </p>
                </div>
            </div>
        </div>
    );
}
