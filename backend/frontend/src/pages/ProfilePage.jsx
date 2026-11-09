import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Package, 
  Phone, 
  MapPin, 
  Lock, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.hash === '#pesanan' ? 'orders' : 'profile'
  );

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    document.title = 'IKANKU | Profil Akun & Riwayat Pesanan';
    if (!isAuthenticated) {
      navigate('/login?redirect=/profil');
      return;
    }

    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.warn('Failed to load customer orders:', err.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    const payload = {
      name,
      phone,
      address,
    };

    if (newPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
      payload.new_password_confirmation = newPasswordConfirmation;
    }

    const res = await updateProfile(payload);
    setSaving(false);

    if (res.success) {
      setMessage(res.message || 'Profil berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Greeting Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-ocean-600 to-turquoise-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-ocean-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-ocean-100 text-ocean-700">
                    Administrator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{user?.email} • Pelanggan IKANKU Pasanggar</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 transition"
              >
                Buka Dashboard Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3.5 text-sm font-bold flex items-center gap-2 transition border-b-2 ${
              activeTab === 'profile'
                ? 'border-ocean-600 text-ocean-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Pengaturan Profil
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3.5 text-sm font-bold flex items-center gap-2 transition border-b-2 ${
              activeTab === 'orders'
                ? 'border-ocean-600 text-ocean-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Riwayat Pesanan ({orders.length})
          </button>
        </div>

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm max-w-2xl">
            {message && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">No. Telepon / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Alamat Lengkap Pengiriman</label>
                <textarea
                  required
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                ></textarea>
              </div>

              {/* Password update (optional) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-ocean-600" />
                  Ganti Kata Sandi (Opsional)
                </h4>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    placeholder="Masukkan sandi lama jika ingin mengganti"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Kata Sandi Baru</label>
                    <input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Konfirmasi Sandi Baru</label>
                    <input
                      type="password"
                      placeholder="Ulangi kata sandi"
                      value={newPasswordConfirmation}
                      onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Memuat riwayat transaksi...</p>
              </div>
            ) : orders.length > 0 ? (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ocean-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 text-base">
                        {ord.order_number}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-ocean-50 text-ocean-700 border border-ocean-100">
                        {ord.status_label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tanggal: {ord.created_at} • Total {ord.items_count} ekor ikan
                    </p>
                    <p className="text-sm font-black text-ocean-700 pt-1">
                      {ord.formatted_total}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/pesanan/${ord.order_number}`}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-ocean-600 hover:text-white hover:bg-ocean-600 border border-ocean-200 hover:border-ocean-600 transition flex items-center gap-1.5"
                    >
                      <span>Lihat Rincian / Pembayaran</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Belum Ada Riwayat Pesanan</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Anda belum pernah melakukan pembelian ikan hias di IKANKU.
                </p>
                <Link
                  to="/katalog"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 transition"
                >
                  Mulai Belanja Ikan Sekarang
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
