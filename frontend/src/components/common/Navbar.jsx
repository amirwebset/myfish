import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X, Fish, ChevronDown, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-ocean-600 bg-ocean-50/80'
        : 'text-slate-600 hover:text-ocean-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-ocean-600 to-turquoise-500 flex items-center justify-center text-white shadow-md shadow-ocean-500/25 group-hover:scale-105 transition-transform">
              <Fish className="w-6 h-6 transform -rotate-12" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-ocean-700 via-ocean-600 to-turquoise-600 bg-clip-text text-transparent">
                IKANKU
              </span>
              <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Desa Pasanggar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Beranda
            </NavLink>
            <NavLink to="/katalog" className={navLinkClass}>
              Katalog Ikan
            </NavLink>
            <NavLink to="/tentang" className={navLinkClass}>
              Tentang Kami
            </NavLink>
            <NavLink to="/kontak" className={navLinkClass}>
              Kontak
            </NavLink>
          </nav>

          {/* Action Icons & User Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/keranjang"
              className="relative p-2.5 text-slate-700 hover:text-ocean-600 rounded-xl hover:bg-ocean-50 transition-colors"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100/80 border border-slate-200 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-ocean-100 text-ocean-700 font-bold flex items-center justify-center text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Akun Anda
                      </p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-ocean-100 text-ocean-700">
                          Administrator
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-ocean-700 hover:bg-ocean-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard Admin
                      </Link>
                    )}

                    <Link
                      to="/profil"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profil Saya
                    </Link>

                    <Link
                      to="/profil#pesanan"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Riwayat Pesanan
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-ocean-600 to-turquoise-600 hover:from-ocean-700 hover:to-turquoise-700 shadow-md shadow-ocean-500/20 hover:shadow-lg hover:shadow-ocean-500/30 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Masuk</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2">
          <NavLink
            to="/"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-ocean-50 hover:text-ocean-600"
          >
            Beranda
          </NavLink>
          <NavLink
            to="/katalog"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-ocean-50 hover:text-ocean-600"
          >
            Katalog Ikan
          </NavLink>
          <NavLink
            to="/tentang"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-ocean-50 hover:text-ocean-600"
          >
            Tentang Kami
          </NavLink>
          <NavLink
            to="/kontak"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-ocean-50 hover:text-ocean-600"
          >
            Kontak
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-ocean-600 bg-ocean-50"
            >
              Dashboard Administrator
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
