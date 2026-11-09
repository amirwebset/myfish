import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag, MapPin, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    document.title = 'IKANKU Admin | Data Pelanggan Terdaftar';
  }, []);

  const fetchCustomers = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = { page: targetPage };
      if (search) params.search = search;

      const res = await api.get('/admin/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      }
    } catch (err) {
      console.warn('Failed to load customers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCustomers(1);
  }, [search]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCustomers(newPage);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Data Pelanggan Terdaftar
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Daftar pembeli ikan hias yang memiliki akun di IKANKU Pasanggar beserta riwayat total transaksinya.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, email, atau no. telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Nama Pelanggan</th>
                <th className="px-4 py-3.5">Kontak</th>
                <th className="px-4 py-3.5">Alamat Terdaftar</th>
                <th className="px-4 py-3.5">Total Pesanan</th>
                <th className="px-4 py-3.5">Total Belanja (Omset)</th>
                <th className="px-5 py-3.5 text-right">Terdaftar Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block text-sm">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.email}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700 font-mono">{c.phone}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-600">
                      {c.address}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-ocean-50 text-ocean-700">
                        {c.orders_count} pesanan
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-ocean-700 text-sm">
                      {c.formatted_total_spent}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400">
                      {c.created_at}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Tidak ada pelanggan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
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

    </div>
  );
}
