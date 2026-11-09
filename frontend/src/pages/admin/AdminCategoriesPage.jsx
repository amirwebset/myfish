import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Fish');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'IKANKU Admin | Kelola Kategori Ikan';
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Fish');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
    setIcon(c.icon || 'Fish');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingCategory) {
        const res = await api.put(`/admin/categories/${editingCategory.id}`, {
          name,
          description,
          icon,
        });
        if (res.data.success) {
          setMessage('Kategori berhasil diperbarui.');
          setIsModalOpen(false);
          await fetchCategories();
        }
      } else {
        const res = await api.post('/admin/categories', {
          name,
          description,
          icon,
        });
        if (res.data.success) {
          setMessage('Kategori baru berhasil ditambahkan.');
          setIsModalOpen(false);
          await fetchCategories();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan kategori.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Hapus kategori '${catName}'?`)) return;

    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.data.success) {
        setMessage(`Kategori '${catName}' berhasil dihapus.`);
        await fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kelola Kategori Ikan Hias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur pengelompokan jenis ikan (cupang, koi, guppy, predator, dll.) untuk memudahkan pencarian pelanggan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori Baru
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Nama Kategori</th>
                <th className="px-4 py-3.5">Slug URL</th>
                <th className="px-4 py-3.5">Deskripsi</th>
                <th className="px-4 py-3.5">Jumlah Produk</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400">
                    Memuat daftar kategori...
                  </td>
                </tr>
              ) : categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                    {c.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                    {c.description || '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-md font-bold text-[11px] bg-ocean-50 text-ocean-700">
                      {c.products_count} produk
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ikan Cupang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows="3"
                  placeholder="Penjelasan varian ikan dalam kategori ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
