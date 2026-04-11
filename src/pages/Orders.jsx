import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Wishlist.css'; // orders styles live here

const STATUS_COLORS = {
    PLACED: '#f59e0b',
    SHIPPED: '#3b82f6',
    OUT_FOR_DELIVERY: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
};

const STATUS_STEPS = ['PLACED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function StatusTimeline({ currentStatus }) {
    if (currentStatus === 'CANCELLED') {
        return (
            <div className="status-timeline-cancelled">
                <span className="dot cancelled"></span>
                <span className="cancel-label">Order Cancelled</span>
            </div>
        );
    }

    const currentIndex = STATUS_STEPS.indexOf(currentStatus);

    return (
        <div className="status-timeline">
            {STATUS_STEPS.map((step, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const label = step.replace(/_/g, ' ');

                return (
                    <div key={step} className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="step-point">
                            {isActive ? '✓' : index + 1}
                        </div>
                        <span className="step-label">{label}</span>
                        {index < STATUS_STEPS.length - 1 && (
                            <div className={`step-line ${index < currentIndex ? 'active' : ''}`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/orders/user/${user.userId}`);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    return (
        <div className="orders-page">
            <h1>My Orders</h1>

            {error && (
                <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {!orders.length && !error ? (
                <div className="empty-state">
                    <p>📦 No orders yet.</p>
                    <a href="/books">Start shopping!</a>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.orderId} className="order-card">
                            <div className="order-header">
                                <div className="order-meta">
                                    <span className="order-id">#{order.orderId?.slice(0, 8)}</span>
                                    <span className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="order-status-badge" style={{ color: STATUS_COLORS[order.status] }}>
                                    {order.status.replace(/_/g, ' ')}
                                </div>
                            </div>

                            <div className="order-timeline-section">
                                <StatusTimeline currentStatus={order.status} />
                            </div>

                            <div className="order-items">
                                {order.items?.map((item, i) => (
                                    <div key={i} className="order-item-detailed">
                                        <div className="item-icon">📖</div>
                                        <div className="item-details">
                                            <div className="item-title">{item.title || item.bookId}</div>
                                        </div>
                                        <div className="item-pricing">
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                            <span className="item-price">₹{item.priceAtAdding || item.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            <div className="order-footer">
                                <strong>Total: ₹{order.totalPrice?.toFixed(2)}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
