import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { items, count, subtotal, formattedSubtotal, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipient_name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
    payment_method: 'bank_transfer',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else if (items.length === 0) {
      navigate('/keranjang');
    }
  }, [isAuthenticated, items.length, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.recipient_name || !formData.phone || !formData.address) {
      setError('Mohon lengkapi Nama Penerima, Nomor Telepon, dan Alamat Pengiriman.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/checkout', formData);
      if (res.data.success) {
        await fetchCart(); // Refresh cart (will now be empty)
        navigate(`/pesanan/${res.data.order.order_number}`, {
          state: { newOrder: true }
        });
      } else {
        setError(res.data.message || 'Gagal memproses pesanan.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link & Title */}
        <div className="mb-8">
          <Link
            to="/keranjang"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-ocean-600 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Keranjang
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Checkout Pesanan Ikan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lengkapi data penerima dan alamat pengiriman untuk proses pengiriman ikan hidup bergaransi.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Membuat Pesanan</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Shipping Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Recipient Details Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-700 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Data Penerima & Kontak</h3>
                    <p className="text-xs text-slate-400">Pastikan nomor aktif untuk koordinasi kurir</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap Penerima *
                    </label>
                    <input
                      type="text"
                      name="recipient_name"
                      required
                      value={formData.recipient_name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      No. WhatsApp / Telepon *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten, kode pos"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Catatan Khusus Pengiriman (Opsional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Contoh: Titipkan di pos satpam, packing ekstra oksigen"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                  />
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-turquoise-100 text-turquoise-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Metode Pembayaran</h3>
                    <p className="text-xs text-slate-400">Transfer manual diverifikasi langsung oleh Admin</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border-2 border-ocean-600 bg-ocean-50/40 flex items-start gap-4">
                  <input
                    type="radio"
                    name="payment_method"
                    id="bank_transfer"
                    value="bank_transfer"
                    checked={formData.payment_method === 'bank_transfer'}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="bank_transfer" className="block text-sm font-bold text-slate-800 cursor-pointer">
                      Transfer Bank Manual (BCA, Mandiri, BRI)
                    </label>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Anda akan menerima nomor rekening dan rincian transfer setelah pesanan dibuat. Anda dapat langsung mengunggah foto bukti transfer untuk mempercepat verifikasi.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm sticky top-28 space-y-6">
                <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                  Ringkasan Belanja ({count} item)
                </h3>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.image_url || '/images/default-fish.jpg'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-slate-400">{item.quantity} x {item.formatted_price}</p>
                      </div>
                      <span className="font-extrabold text-slate-800">{item.formatted_subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-bold text-slate-800">{formattedSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packing Oksigen & Box</span>
                    <span className="font-bold text-emerald-600">Gratis (Standar Aman)</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline text-sm">
                    <span className="font-black text-slate-900">Total Pembayaran</span>
                    <span className="text-2xl font-black text-ocean-700">{formattedSubtotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-ocean-600 to-turquoise-600 hover:from-ocean-700 hover:to-turquoise-700 shadow-xl shadow-ocean-600/20 hover:shadow-ocean-600/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    'Memproses Pesanan...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Buat Pesanan Sekarang
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-turquoise-600 shrink-0" />
                  <span>Transaksi aman dengan verifikasi admin Desa Pasanggar</span>
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
