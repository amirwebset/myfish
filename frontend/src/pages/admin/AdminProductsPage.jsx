import React, { useEffect, useState } from 'react';
import { 
  Fish, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  Star,
  Link as LinkIcon
} from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../data/mockProducts';
import { isSupabaseConfigured, supabase } from '../../services/supabase';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    is_featured: false,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    document.title = 'IKANKU Admin | Kelola Produk Ikan Hias';
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCategories(res.data.data);
        return;
      }
    } catch (err) {
      console.warn('Backend categories unavailable, using local categories:', err.message);
    }
    setCategories(MOCK_CATEGORIES);
  };

  const fetchProducts = async (targetPage = page) => {
    setLoading(true);

    // 1. Coba ambil dari backend API Laravel jika aktif lokal
    try {
      const params = { page: targetPage };
      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;

      const res = await api.get('/admin/products', { params });
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setProducts(res.data.data);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      // Backend unavailable, lanjutkan ke Supabase / local
    }

    // 2. Coba ambil dari Supabase Cloud Database jika terhubung
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase.from('products').select('*', { count: 'exact' });
        if (search.trim()) q = q.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
        if (categoryFilter) q = q.ilike('category', `%${categoryFilter}%`);
        const { data, count, error } = await q.order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map(p => ({
            ...p,
            formatted_price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.price),
            category: typeof p.category === 'object' ? p.category : { id: p.category, name: p.category },
          }));
          setProducts(formatted);
          setMeta({ current_page: 1, last_page: 1, total: count || formatted.length });
          setLoading(false);
          return;
        }
      } catch (sbErr) {
        console.warn('Supabase fetch products fallback:', sbErr);
      }
    }

    // 3. Fallback cerdas: Baca dari LocalStorage ('ikanku_admin_products') atau MOCK_PRODUCTS
    let stored = localStorage.getItem('ikanku_admin_products');
    let list = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];
    if (stored) {
      list = list.map(item => {
        const mock = MOCK_PRODUCTS.find(m => m.id === item.id);
        if (mock && !item.is_user_created) {
          return { ...item, image_url: mock.image_url };
        }
        return item;
      });
      localStorage.setItem('ikanku_admin_products', JSON.stringify(list));
    } else {
      localStorage.setItem('ikanku_admin_products', JSON.stringify(list));
    }

    if (search.trim()) {
      const s = search.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
    }
    if (categoryFilter) {
      list = list.filter(p => 
        String(p.category_id) === String(categoryFilter) || 
        p.category?.slug === categoryFilter ||
        p.category?.name?.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    setProducts(list);
    setMeta({ current_page: 1, last_page: 1, total: list.length });
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [search, categoryFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProducts(newPage);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || 1,
      price: '',
      stock: '',
      description: '',
      image_url: '',
      is_featured: false,
      is_active: true,
    });
    setImageFile(null);
    setImagePreview('');
    setActionError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id || p.category?.id || 1,
      price: p.price,
      stock: p.stock,
      description: p.description || '',
      image_url: p.image_url || '',
      is_featured: !!p.is_featured,
      is_active: !!p.is_active,
    });
    setImageFile(null);
    setImagePreview(p.image_url || '');
    setActionError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    setSubmitting(true);

    const priceNum = parseFloat(formData.price) || 0;
    const stockNum = parseInt(formData.stock, 10) || 0;
    const catObj = categories.find(c => String(c.id) === String(formData.category_id)) || categories[0] || { id: 1, name: 'Ikan Cupang' };
    const imgUrl = imagePreview || formData.image_url || 'https://images.unsplash.com/photo-1544943910-4c1dc44a046c?auto=format&fit=crop&w=800&q=80';

    // 1. Simpan ke Supabase jika terhubung
    if (isSupabaseConfigured() && supabase) {
      try {
        const payload = {
          name: formData.name,
          category: catObj.name,
          price: priceNum,
          stock: stockNum,
          description: formData.description,
          image_url: imgUrl,
          is_featured: formData.is_featured,
          is_active: formData.is_active,
        };

        if (editingProduct) {
          await supabase.from('products').update(payload).eq('id', editingProduct.id);
        } else {
          payload.slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
          await supabase.from('products').insert(payload);
        }
      } catch (sbErr) {
        console.warn('Supabase product sync warning:', sbErr.message);
      }
    }

    // 2. Simpan ke Local Storage ('ikanku_admin_products') agar CRUD 100% jalan di Vercel demo
    let stored = localStorage.getItem('ikanku_admin_products');
    let list = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];

    if (editingProduct) {
      list = list.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            category_id: catObj.id,
            category: catObj,
            price: priceNum,
            formatted_price: 'Rp ' + priceNum.toLocaleString('id-ID'),
            stock: stockNum,
            description: formData.description,
            image_url: imgUrl,
            is_featured: formData.is_featured,
            is_active: formData.is_active,
          };
        }
        return p;
      });
      setActionSuccess('Data produk ikan berhasil diperbarui!');
    } else {
      const newProduct = {
        id: 'fish_' + Date.now(),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
        category_id: catObj.id,
        category: catObj,
        price: priceNum,
        formatted_price: 'Rp ' + priceNum.toLocaleString('id-ID'),
        stock: stockNum,
        description: formData.description,
        image_url: imgUrl,
        breeder: 'Kelompok Peternak Desa Pasanggar',
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };
      list.unshift(newProduct);
      setActionSuccess('Produk ikan baru berhasil ditambahkan ke katalog!');
    }

    localStorage.setItem('ikanku_admin_products', JSON.stringify(list));

    // 3. Coba kirim ke API backend jika tersedia
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('description', formData.description);
      data.append('is_featured', formData.is_featured ? '1' : '0');
      data.append('is_active', formData.is_active ? '1' : '0');
      if (imageFile) data.append('image', imageFile);

      if (editingProduct) {
        await api.post(`/admin/products/${editingProduct.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
    } catch (apiErr) {
      // Ignored if backend offline
    }

    setIsModalOpen(false);
    setSubmitting(false);
    await fetchProducts();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus produk ikan '${name}' dari sistem katalog?`)) return;

    // 1. Coba hapus di Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {}
    }

    // 2. Hapus dari Local Storage
    let stored = localStorage.getItem('ikanku_admin_products');
    let list = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];
    list = list.filter(p => p.id !== id);
    localStorage.setItem('ikanku_admin_products', JSON.stringify(list));

    // 3. Coba hapus di backend API
    try {
      await api.delete(`/admin/products/${id}`);
    } catch (e) {}

    setActionSuccess(`Produk '${name}' berhasil dihapus.`);
    await fetchProducts();
    setTimeout(() => setActionSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kelola Produk Ikan Hias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah varian ikan baru, perbarui stok kolam, harga jual, dan foto katalog.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Ikan Baru
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama ikan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-52 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Foto & Nama Ikan</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Harga Jual</th>
                <th className="px-4 py-3.5">Stok Kolam</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Memuat data produk ikan...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={p.image_url || '/images/default-fish.svg'}
                        alt={p.name}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/default-fish.svg';
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">{p.name}</span>
                        {p.is_featured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Produk Unggulan
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {p.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-ocean-700 text-sm">
                      {p.formatted_price}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md font-extrabold text-[11px] ${
                        p.stock <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : p.stock <= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.stock} ekor
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition"
                          title="Edit Produk"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Tidak ada produk ikan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Products Table Pagination */}
        <div className="border-t border-slate-100 px-4">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            total={meta.total}
            perPage={20}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modal Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Produk Ikan' : 'Tambah Ikan Hias Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Ikan Hias *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ikan Cupang Halfmoon Blue Rim"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-ocean-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Tersedia (Ekor) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi & Catatan Ikan</label>
                <textarea
                  rows="3"
                  placeholder="Kondisi kesehatan, karakter makan, keunikan motif sirip..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar / Foto Ikan (Direct Link)</label>
                <div className="relative mb-2">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... atau pilih file di bawah"
                    value={formData.image_url || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      if (e.target.value) setImagePreview(e.target.value);
                    }}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                  />
                </div>

                <label className="block font-bold text-slate-700 mb-1">Atau Upload Foto dari Komputer</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ocean-50 file:text-ocean-700"
                />
                {imagePreview && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] text-slate-400">Pratinjau foto ikan siap tampil</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-ocean-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Tampilkan di Produk Unggulan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-ocean-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Status Aktif Tayang</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
