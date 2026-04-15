import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Package, Shield, LifeBuoy, LogOut } from 'lucide-react';
import './MyAccountLayout.css';

const navItems = [
  { to: 'profile',   label: 'Profile',   icon: User },
  { to: 'addresses', label: 'Addresses', icon: MapPin },
  { to: 'orders',    label: 'Orders',    icon: Package },
  { to: 'security',  label: 'Security',  icon: Shield },
  { to: 'support',   label: 'Support',   icon: LifeBuoy },
];

export default function MyAccountLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="account-root">
      <aside className="account-sidebar">
        <h2 className="sidebar-heading">My Account</h2>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      <main className="account-content">
        <Outlet />
      </main>
    </div>
  );
}
