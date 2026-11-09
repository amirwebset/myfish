import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Fish, Mail, Lock, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'IKANKU | Masuk Akun';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin' && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ocean-600 to-turquoise-500 text-white flex items-center justify-center shadow-lg shadow-ocean-500/25">
              <Fish className="w-7 h-7 transform -rotate-12" />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900">IKANKU</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">Masuk ke Akun Anda</h2>
          <p className="text-xs text-slate-500 mt-1">
            Belanja ikan hias sehat langsung dari peternak Desa Pasanggar
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-ocean-600 to-turquoise-600 hover:from-ocean-700 hover:to-turquoise-700 shadow-md shadow-ocean-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Memeriksa Kredensial...' : 'Masuk Sekarang'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Testing & Examiner */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              Akses Cepat Uji Coba Demo
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@pasanggarfish.com', 'admin123')}
                className="p-2.5 rounded-xl border border-ocean-200 bg-ocean-50/50 hover:bg-ocean-100/70 text-ocean-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Shield className="w-3.5 h-3.5 text-ocean-600" />
                Akun Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('pelanggan@gmail.com', 'password123')}
                className="p-2.5 rounded-xl border border-turquoise-200 bg-turquoise-50/50 hover:bg-turquoise-100/70 text-turquoise-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <User className="w-3.5 h-3.5 text-turquoise-600" />
                Akun Pelanggan
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Belum memiliki akun?{' '}
          <Link to="/register" className="font-bold text-ocean-600 hover:text-ocean-700">
            Daftar Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
}
