import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Fish, ChevronDown } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters or searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
          sort: searchParams.get('sort') || 'latest',
          min_price: searchParams.get('min_price') || undefined,
          max_price: searchParams.get('max_price') || undefined,
          per_page: 24,
        };

        const res = await api.get('/products', { params });
        if (res.data.success) {
          setProducts(res.data.data);
          setMeta(res.data.meta);
        }
      } catch (err) {
        console.warn('Failed to load catalog products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Apply filters to URL
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    const newParams = {};
    if (search.trim()) newParams.search = search.trim();
    if (selectedCategory) newParams.category = selectedCategory;
    if (sort) newParams.sort = sort;
    if (minPrice) newParams.min_price = minPrice;
    if (maxPrice) newParams.max_price = maxPrice;

    setSearchParams(newParams);
  };

  const handleResetFilter = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('latest');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const handleCategorySelect = (slug) => {
    const newCategory = selectedCategory === slug ? '' : slug;
    setSelectedCategory(newCategory);
    
    const newParams = Object.fromEntries(searchParams.entries());
    if (newCategory) {
      newParams.category = newCategory;
    } else {
      delete newParams.category;
    }
    setSearchParams(newParams);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
            Koleksi Lengkap
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Katalog Ikan Hias Desa Pasanggar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Menampilkan seluruh ikan hias budidaya lokal siap adopsi dengan jaminan kualitas dan garansi pengiriman.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm mb-8 space-y-4">
          <form onSubmit={handleApplyFilter} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ikan hias (cupang, koi, guppy...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  const p = Object.fromEntries(searchParams.entries());
                  p.sort = e.target.value;
                  setSearchParams(p);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm font-medium bg-white text-slate-700"
              >
                <option value="latest">Urutan: Terbaru</option>
                <option value="price_asc">Harga: Termurah ke Termahal</option>
                <option value="price_desc">Harga: Termahal ke Termurah</option>
                <option value="name_asc">Nama: A - Z</option>
              </select>
            </div>

            {/* Price Filter (Min - Max) */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min Rp"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 text-xs"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max Rp"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs shadow-md shadow-ocean-600/20 transition"
              >
                Terapkan
              </button>

              <button
                type="button"
                onClick={handleResetFilter}
                title="Reset Filter"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Category Chips Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-ocean-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
                {cat.products_count !== undefined && (
                  <span className="ml-1 opacity-70">({cat.products_count})</span>
                )}
              </button>
            ))}
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
          <span>Menampilkan <strong className="text-slate-800">{products.length}</strong> produk ikan</span>
          {selectedCategory && (
            <span className="bg-ocean-50 text-ocean-700 px-2.5 py-1 rounded-md font-semibold">
              Kategori: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200/80 animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto mb-4">
              <Fish className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Ikan Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada ikan hias yang cocok dengan kriteria pencarian atau filter yang Anda terapkan.
            </p>
            <button
              onClick={handleResetFilter}
              className="mt-5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-ocean-600 hover:bg-ocean-700 transition"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
