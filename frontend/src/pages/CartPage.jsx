import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  ArrowLeft,
  Fish,
  AlertTriangle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, count, subtotal, formattedSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const hasOutOfStockItem = items.some(item => !item.is_in_stock);

  if (items.length === 0) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Keranjang Masih Kosong</h2>
          <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
            Anda belum menambahkan ikan hias ke dalam keranjang belanja. Temukan aneka ikan cupang, koi, guppy, dan predator pilihan dari Desa Pasanggar sekarang!
          </p>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-ocean-600 hover:bg-ocean-700 shadow-lg shadow-ocean-600/25 transition"
          >
            <Fish className="w-4 h-4" />
            Mulai Belanja Ikan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
              Rincian Belanja
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Keranjang Belanja ({count} ekor)
            </h1>
          </div>
          
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kosongkan Keranjang
          </button>
        </div>

        {hasOutOfStockItem && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Perhatian Stok Ikan</p>
              <p className="text-xs mt-0.5">
                Terdapat produk di keranjang Anda yang melebihi jumlah stok tersedia di kolam peternak. Silakan sesuaikan jumlah pembelian sebelum melanjutkan ke pembayaran.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5"
              >
                {/* Fish Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  <img
                    src={item.image_url || '/images/default-fish.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link
                    to={`/katalog/${item.slug || item.product_id}`}
                    className="text-base font-bold text-slate-800 hover:text-ocean-600 line-clamp-1 transition"
                  >
                    {item.name}
                  </Link>

                  <p className="text-xs text-slate-400 mt-1">
                    Harga Satuan: <strong className="text-slate-700">{item.formatted_price}</strong>
                  </p>

                  {!item.is_in_stock && (
                    <span className="inline-block mt-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      Melebihi stok (Tersedia: {item.stock})
                    </span>
                  )}

                  {/* Quantity Controls Mobile & Subtotal */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 sm:hidden">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-500 hover:text-slate-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-ocean-700">
                        {item.formatted_subtotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop Quantity & Price */}
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-black text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-white transition disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-28 text-right">
                    <span className="text-xs text-slate-400 block font-medium">Subtotal</span>
                    <span className="text-base font-black text-ocean-700">
                      {item.formatted_subtotal}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Hapus Ikan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}

            <div className="pt-2">
              <Link
                to="/katalog"
                className="inline-flex items-center gap-2 text-sm font-bold text-ocean-600 hover:text-ocean-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Tambah Ikan Lainnya
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm sticky top-28 space-y-6">
              <h3 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
                Ringkasan Pesanan
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total Jumlah Ikan</span>
                  <span className="font-bold text-slate-800">{count} ekor</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk</span>
                  <span className="font-bold text-slate-800">{formattedSubtotal}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Packing Khusus Styrofoam
                    <Truck className="w-3.5 h-3.5 text-turquoise-600" />
                  </span>
                  <span className="font-bold text-emerald-600">Gratis (Promo)</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-black text-slate-900">Total Pembayaran</span>
                  <span className="text-2xl font-black text-ocean-700">{formattedSubtotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={hasOutOfStockItem}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  hasOutOfStockItem
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-ocean-600 hover:bg-ocean-700 text-white shadow-ocean-600/25 hover:shadow-ocean-600/40 active:scale-98'
                }`}
              >
                Lanjut ke Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3.5 rounded-xl bg-ocean-50/60 border border-ocean-100 text-xs text-ocean-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-ocean-600" />
                  <span>Garansi Aman 100%</span>
                </div>
                <p className="text-ocean-700/80 leading-relaxed text-[11px]">
                  Pembayaran melalui transfer bank manual yang akan diverifikasi secara teliti oleh admin sebelum ikan dikemas.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
