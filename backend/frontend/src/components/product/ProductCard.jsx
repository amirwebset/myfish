import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0 || isAdding) return;

    setIsAdding(true);
    const res = await addToCart(product.id, 1);
    setIsAdding(false);

    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-ocean-300 transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.image_url || product.image || '/images/default-fish.svg'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/default-fish.svg';
          }}
        />

        {/* Category Pill */}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-ocean-700 shadow-sm border border-white/60">
            {product.category.name}
          </span>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-sm">
            Habis
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
            Sisa {product.stock}
          </span>
        ) : null}

        {/* Quick View Overlay on Hover */}
        <Link
          to={`/katalog/${product.slug || product.id}`}
          className="absolute inset-0 bg-ocean-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-ocean-600" />
            Lihat Detail
          </span>
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        <Link
          to={`/katalog/${product.slug || product.id}`}
          className="text-base font-bold text-slate-800 hover:text-ocean-600 line-clamp-1 transition-colors mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description || 'Ikan hias pilihan peternak Desa Pasanggar, kondisi lincah, sehat, dan siap mempercantik akuarium Anda.'}
        </p>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Harga</span>
            <span className="text-lg font-black text-ocean-700">
              {product.formatted_price || `Rp ${Number(product.price).toLocaleString('id-ID')}`}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`p-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-ocean-600 hover:bg-ocean-700 text-white shadow-md shadow-ocean-600/20 hover:shadow-ocean-600/35 active:scale-95'
            }`}
            title={isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
          >
            {justAdded ? (
              <Check className="w-5 h-5 animate-scale" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
