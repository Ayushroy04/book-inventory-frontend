import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import MyAccountLayout from './layouts/MyAccountLayout';
import Profile from './pages/account/Profile';
import Addresses from './pages/account/Addresses';
import AccountOrders from './pages/account/Orders';
import Security from './pages/account/Security';

// Redirect unauthenticated users to /login
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    console.warn('ProtectedRoute: no user found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:bookId" element={<BookDetail />} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

        {/* My Account - Protected */}
        <Route path="/my-account" element={<ProtectedRoute><MyAccountLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="security" element={<Security />} />
          <Route path="support" element={<div className="coming-soon">Support (Coming Soon)</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
