import { NavLink, Outlet } from 'react-router-dom';
import { User, MapPin, Package, Shield, LifeBuoy } from 'lucide-react';
import './MyAccountLayout.css';

const navItems = [
  { to: 'profile',   label: 'Profile',   icon: User },
  { to: 'addresses', label: 'Addresses', icon: MapPin },
  { to: 'orders',    label: 'Orders',    icon: Package },
  { to: 'security',  label: 'Security',  icon: Shield },
  { to: 'support',   label: 'Support',   icon: LifeBuoy },
];

export default function MyAccountLayout() {
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
        </nav>
      </aside>
      <main className="account-content">
        <Outlet />
      </main>
    </div>
  );
}
