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
  Truck,
  Box,
  Sparkles,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { items, count, subtotal, formattedSubtotal, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Opsi Ekspedisi Khusus Ikan Hidup
  const shippingOptions = [
    {
      id: 'jne_yes',
      name: 'JNE YES (Yakin Esok Sampai)',
      desc: 'Rekomendasi Utama: Pengiriman 1 hari sampai untuk menjamin keselamatan ikan.',
      cost: 25000,
      badge: 'Paling Cepat'
    },
    {
      id: 'tiki_ons',
      name: 'TIKI ONS (Over Night Services)',
      desc: 'Layanan kilat 24 jam dengan penanganan kargo hewan hidup resmi.',
      cost: 28000,
      badge: 'Aman'
    },
    {
      id: 'travel_express',
      name: 'Travel Express Antarkota (Jawa-Madura)',
      desc: 'Pengiriman via bus/travel langsung tiba di hari yang sama.',
      cost: 35000,
      badge: 'Same Day'
    }
  ];

  // Opsi Kemasan Khusus
  const packingOptions = [
    {
      id: 'standard',
      name: 'Standar Tabung Oksigen & Plastik Dobel',
      desc: 'Kemasan plastik dobel oksigen murni, daya tahan 24-36 jam.',
      cost: 0,
      badge: 'Gratis Promo'
    },
    {
      id: 'premium_styrofoam',
      name: 'Ekstra Box Styrofoam Tebal & Ice Pack',
      desc: 'Sangat disarankan untuk pengiriman luar Madura/Jawa Timur agar suhu air tetap stabil.',
      cost: 15000,
      badge: 'Sangat Disarankan'
    }
  ];

  const [selectedCourier, setSelectedCourier] = useState(shippingOptions[0]);
  const [selectedPacking, setSelectedPacking] = useState(packingOptions[0]);
  const [uniqueCode] = useState(() => Math.floor(100 + Math.random() * 899)); // 3 digit unik

  const [formData, setFormData] = useState({
    recipient_name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
    payment_method: 'bank_transfer',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'IKANKU | Checkout & Pembayaran Pesanan';
  }, []);

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

  // Kalkulasi Total Real-time
  const shippingCost = selectedCourier.cost;
  const packingCost = selectedPacking.cost;
  const grandTotal = subtotal + shippingCost + packingCost + uniqueCode;
  const formattedGrandTotal = 'Rp ' + Number(grandTotal).toLocaleString('id-ID');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.recipient_name || !formData.phone || !formData.address) {
      setError('Mohon lengkapi Nama Penerima, Nomor Telepon, dan Alamat Pengiriman.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      shipping_courier: selectedCourier.name,
      shipping_cost: shippingCost,
      packing_type: selectedPacking.name,
      packing_cost: packingCost,
      unique_code: uniqueCode,
    };

    try {
      const res = await api.post('/checkout', payload);
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
            Checkout Pesanan Ikan Hias
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lengkapi data penerima, pilih ekspedisi kilat dan kemasan bergaransi untuk keselamatan ikan sampai di tujuan.
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
            
            {/* Left Column: Forms */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Recipient Details Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-700 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Data Penerima & Kontak</h3>
                    <p className="text-xs text-slate-400">Pastikan nomor aktif WhatsApp untuk koordinasi kurir</p>
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
                    placeholder="Contoh: Titipkan di satpam, kirim pagi hari"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
                  />
                </div>
              </div>

              {/* 2. Kurir Ekspedisi Khusus Ikan Hidup */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Pilihan Ekspedisi Kilat Hewan Hidup</h3>
                    <p className="text-xs text-slate-400">Wajib 1 hari sampai agar ikan tetap hidup dan bugar</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition cursor-pointer ${
                        selectedCourier.id === opt.id
                          ? 'border-ocean-600 bg-ocean-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_courier"
                        checked={selectedCourier.id === opt.id}
                        onChange={() => setSelectedCourier(opt)}
                        className="mt-1 w-4 h-4 text-ocean-600 focus:ring-ocean-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm">{opt.name}</span>
                          <span className="font-black text-ocean-700 text-sm">
                            Rp {opt.cost.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                          {opt.badge}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Pilihan Kemasan & Tabung Oksigen */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Kemasan Packing Karantina</h3>
                    <p className="text-xs text-slate-400">Proses packing standar Desa Pasanggar dengan oksigen murni</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {packingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition cursor-pointer ${
                        selectedPacking.id === opt.id
                          ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="packing_type"
                        checked={selectedPacking.id === opt.id}
                        onChange={() => setSelectedPacking(opt)}
                        className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm">{opt.name}</span>
                          <span className="font-black text-emerald-700 text-sm">
                            {opt.cost === 0 ? 'Gratis' : `Rp ${opt.cost.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {opt.badge}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Payment Method Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-turquoise-100 text-turquoise-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Metode Pembayaran</h3>
                    <p className="text-xs text-slate-400">Transfer manual diverifikasi langsung oleh Admin Desa Pasanggar</p>
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
                      Dilengkapi dengan 3 digit kode acak unik untuk mempercepat verifikasi otomatis tanpa risiko tertukar dengan pesanan pembeli lain.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm sticky top-28 space-y-6">
                <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                  Rincian Pembayaran ({count} ekor ikan)
                </h3>

                {/* Items Mini List */}
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.image_url || '/images/default-fish.svg'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/default-fish.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-slate-400">{item.quantity} ekor x {item.formatted_price}</p>
                      </div>
                      <span className="font-extrabold text-slate-800">{item.formatted_subtotal}</span>
                    </div>
                  ))}
                </div>

                {/* Itemized Calculation */}
                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal Produk Ikan</span>
                    <span className="font-bold text-slate-800">{formattedSubtotal}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block font-medium">Ongkos Kirim Ikan</span>
                      <span className="text-[10px] text-slate-400">{selectedCourier.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      Rp {shippingCost.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block font-medium">Biaya Packing Karantina</span>
                      <span className="text-[10px] text-slate-400">{selectedPacking.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {packingCost === 0 ? 'Gratis' : `Rp ${packingCost.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-ocean-700 bg-ocean-50/50 p-2 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-ocean-600" />
                      <span className="font-bold text-xs">Kode Unik Transfer</span>
                    </div>
                    <span className="font-mono font-bold text-xs">
                      + Rp {uniqueCode}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                    <div>
                      <span className="font-black text-slate-900 text-sm block">Total Tagihan Transfer</span>
                      <span className="text-[10px] text-slate-400">Sudah termasuk kode unik verifikasi</span>
                    </div>
                    <span className="text-2xl font-black text-ocean-700">{formattedGrandTotal}</span>
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

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-turquoise-600 shrink-0" />
                    <span>Garansi 100% Hidup Sampai Tujuan</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Pesanan Anda dikemas dengan oksigen murni. Batas waktu pembayaran 24 jam sebelum kuota stok dirilis kembali.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
