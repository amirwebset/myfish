import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-24 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold tracking-wide">
          Memeriksa sesi login...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Terbatas</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
          Halaman ini khusus untuk Administrator Desa Pasanggar. Akun Anda saat ini ({user?.email}) tidak memiliki hak akses administrator.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}

