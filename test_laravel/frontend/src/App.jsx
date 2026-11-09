import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import NotificationToast from './components/common/NotificationToast';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function AppContent() {
  const location = useLocation();
  const { toast } = useCart();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-ocean-500 selection:text-white">
      {/* Show public navbar on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Customer Routes (Protected & Public) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/katalog/:identifier" element={<ProductDetailPage />} />
          <Route path="/keranjang" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/pesanan/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/tentang" element={<AboutPage />} />
          <Route path="/kontak" element={<ContactPage />} />

          {/* Admin Routes (Guarded by ProtectedRoute adminOnly) */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="produk" element={<AdminProductsPage />} />
            <Route path="kategori" element={<AdminCategoriesPage />} />
            <Route path="pesanan" element={<AdminOrdersPage />} />
            <Route path="pembayaran" element={<AdminPaymentsPage />} />
            <Route path="pelanggan" element={<AdminCustomersPage />} />
            <Route path="laporan" element={<AdminReportsPage />} />
          </Route>
        </Routes>
      </main>

      {/* Show public footer on non-admin routes */}
      {!isAdminRoute && <Footer />}

      {/* Global Interactive Notification Toast */}
      <NotificationToast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
