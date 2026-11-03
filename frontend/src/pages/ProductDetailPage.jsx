import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Check, 
  Minus, 
  Plus, 
  Fish, 
  Layers,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetailPage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setQuantity(1);
      try {
        const res = await api.get(`/products/${identifier}`);
        if (res.data.success) {
          setProduct(res.data.data);
          setRelated(res.data.related || []);
        }
      } catch (err) {
        console.warn('Failed to load product detail:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || isAdding) return;
    setIsAdding(true);
    const res = await addToCart(product.id, quantity);
    setIsAdding(false);
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[4/3] rounded-3xl bg-slate-200 animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-8 w-1/3 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-32 w-full bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Ikan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Produk ikan hias yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/katalog"
          className="px-6 py-2.5 rounded-xl bg-ocean-600 text-white font-bold text-sm inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ocean-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog Ikan
          </Link>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 lg:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Product Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
                <img
                  src={product.image_url || product.image || '/images/default-fish.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {product.category && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-ocean-700 shadow-md">
                    {product.category.name}
                  </span>
                )}

                {isOutOfStock && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-md">
                    Stok Habis
                  </span>
                )}
              </div>

              {/* Demo Notice Banner */}
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Data Demonstrasi:</strong> Gambar dan spesifikasi ini disediakan untuk simulasi penelitian skripsi e-commerce Desa Pasanggar.
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
                  Sentra Pasanggar • Air Tawar Sehat
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-3">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-ocean-700">
                    {product.formatted_price || `Rp ${Number(product.price).toLocaleString('id-ID')}`}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ ekor</span>
                </div>

                {/* Stock Indicator */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                  <span className="font-semibold text-slate-700">Status Stok:</span>
                  {isOutOfStock ? (
                    <span className="text-rose-600 font-bold">Stok Habis</span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                      Tersedia ({product.stock} ekor siap kirim)
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2 mb-8">
                  <h3 className="text-sm font-bold text-slate-800">Deskripsi & Karakteristik:</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.description || 'Ikan hias berkualitas unggul hasil budidaya petani lokal Desa Pasanggar. Kondisi lincah, nafsu makan tinggi, dan bebas penyakit.'}
                  </p>
                </div>
              </div>

              {/* Quantity Selector & Purchase Button */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-extrabold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock || isOutOfStock}
                      className="p-2 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`flex-1 min-w-[200px] py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : addedSuccess
                        ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                        : 'bg-ocean-600 hover:bg-ocean-700 text-white shadow-ocean-600/25 hover:shadow-ocean-600/40 active:scale-98'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        Berhasil Masuk Keranjang!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Tambah ke Keranjang
                      </>
                    )}
                  </button>

                </div>

                {/* Guarantee Features Box */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <ShieldCheck className="w-5 h-5 text-turquoise-600 shrink-0" />
                    <span>Garansi 100% Hidup Sampai Tujuan</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <Truck className="w-5 h-5 text-ocean-600 shrink-0" />
                    <span>Packing Tabung Oksigen Khusus</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
                  Rekomendasi Lainnya
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Ikan Sejenis di Kategori Ini
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
