import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Fish, 
  Layers, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  BarChart3, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Guard: if not authenticated or not admin, redirect
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Halaman ini khusus untuk Administrator Desa Pasanggar. Silakan masuk menggunakan akun admin.
        </p>
        <Link
          to="/login?redirect=/admin"
          className="px-6 py-2.5 rounded-xl bg-ocean-600 text-white font-bold text-xs inline-block"
        >
          Masuk sebagai Admin
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/25'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0 p-5 justify-between min-h-screen sticky top-0">
        <div className="space-y-6">
          
          {/* Admin Brand */}
          <Link to="/admin" className="flex items-center gap-2.5 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-500 to-turquoise-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
              <Fish className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">IKANKU</span>
              <span className="block text-[10px] font-extrabold text-ocean-400 tracking-wider uppercase">
                Panel Admin Desa
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <NavLink to="/admin" end className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink to="/admin/produk" className={navItemClass}>
              <Fish className="w-4 h-4" />
              Kelola Produk
            </NavLink>
            <NavLink to="/admin/kategori" className={navItemClass}>
              <Layers className="w-4 h-4" />
              Kelola Kategori
            </NavLink>
            <NavLink to="/admin/pesanan" className={navItemClass}>
              <ShoppingBag className="w-4 h-4" />
              Kelola Pesanan
            </NavLink>
            <NavLink to="/admin/pembayaran" className={navItemClass}>
              <CreditCard className="w-4 h-4" />
              Verifikasi Pembayaran
            </NavLink>
            <NavLink to="/admin/pelanggan" className={navItemClass}>
              <Users className="w-4 h-4" />
              Data Pelanggan
            </NavLink>
            <NavLink to="/admin/laporan" className={navItemClass}>
              <BarChart3 className="w-4 h-4" />
              Laporan Penjualan
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Lihat Website Toko
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 hidden sm:inline">
              IKANKU E-Commerce Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-ocean-100 text-ocean-700 font-bold flex items-center justify-center text-xs">
                AD
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-tight">{user?.name}</span>
                <span className="text-[10px] text-slate-400">Petugas Desa Pasanggar</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 md:hidden flex">
            <div className="w-64 bg-slate-900 text-white p-5 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <span className="text-lg font-black text-white">IKANKU Admin</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1.5" onClick={() => setIsSidebarOpen(false)}>
                  <NavLink to="/admin" end className={navItemClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/produk" className={navItemClass}>
                    <Fish className="w-4 h-4" />
                    Kelola Produk
                  </NavLink>
                  <NavLink to="/admin/kategori" className={navItemClass}>
                    <Layers className="w-4 h-4" />
                    Kelola Kategori
                  </NavLink>
                  <NavLink to="/admin/pesanan" className={navItemClass}>
                    <ShoppingBag className="w-4 h-4" />
                    Kelola Pesanan
                  </NavLink>
                  <NavLink to="/admin/pembayaran" className={navItemClass}>
                    <CreditCard className="w-4 h-4" />
                    Verifikasi Pembayaran
                  </NavLink>
                  <NavLink to="/admin/pelanggan" className={navItemClass}>
                    <Users className="w-4 h-4" />
                    Data Pelanggan
                  </NavLink>
                  <NavLink to="/admin/laporan" className={navItemClass}>
                    <BarChart3 className="w-4 h-4" />
                    Laporan Penjualan
                  </NavLink>
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link to="/" className="text-xs text-slate-400 block py-1">
                  Lihat Toko Publik
                </Link>
                <button onClick={handleLogout} className="text-xs text-rose-400 font-bold block py-1">
                  Keluar Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Rendered via Outlet */}
        <main className="p-6 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
