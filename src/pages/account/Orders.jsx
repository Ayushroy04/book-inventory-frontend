import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, Truck, XCircle, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',   cls: 'status-pending',   Icon: Clock },
  PROCESSING: { label: 'Processing',cls: 'status-processing',Icon: Clock },
  SHIPPED:    { label: 'Shipped',   cls: 'status-shipped',   Icon: Truck },
  DELIVERED:  { label: 'Delivered', cls: 'status-delivered', Icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled', cls: 'status-cancelled', Icon: XCircle },
};

export default function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/user/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setOrders(Array.isArray(data) ? data : data.content || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="fade-in">
        <div className="page-header"><h1 className="page-title">Order History</h1></div>
        <p style={{ color: '#64748b' }}>Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Order History</h1>
        <p className="page-subtitle">View and track all your recent book orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <Package size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No orders yet. Start browsing our collection!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const Icon = cfg.Icon;
            return (
              <div key={order.orderId} className="glass-panel order-card">
                <div className="order-header">
                  <div>
                    <p className="order-id">Order #{order.orderId?.slice(-8).toUpperCase()}</p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric',month:'long',day:'numeric' })}
                    </p>
                  </div>
                  <span className={`order-status-badge ${cfg.cls}`}>
                    <Icon size={14} /> {cfg.label}
                  </span>
                </div>

                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-img"><FileText size={22} color="#475569" /></div>
                    <div className="order-item-details">
                      <h4>{item.title || item.bookId}</h4>
                      <p>Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                    </div>
                    <span className="order-item-total">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}

                <div className="order-footer">
                  <span className="order-total-price">${Number(order.totalPrice).toFixed(2)}</span>
                  <div className="order-actions">
                    <button className="btn btn-secondary btn-sm">Invoice</button>
                    <button className="btn btn-primary btn-sm">Track</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
