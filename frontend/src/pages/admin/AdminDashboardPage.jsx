import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Fish, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load dashboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-semibold">Memuat data dashboard...</p>
      </div>
    );
  }

  const { summary, status_counts, low_stock_products, recent_orders } = data || {};

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Ringkasan Penjualan Ikan Hias
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau stok produk, verifikasi bukti pembayaran, dan kelola alur transaksi Desa Pasanggar secara terpusat.
        </p>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Omset */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Penjualan
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {summary?.formatted_revenue || 'Rp 0'}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              Dari transaksi terbayar & selesai
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pesanan */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Pesanan
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.total_orders || 0}
            </div>
            <Link to="/admin/pesanan" className="text-[11px] font-bold text-ocean-600 hover:underline mt-1 block">
              Lihat seluruh pesanan →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Produk */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Katalog Produk
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.total_products || 0} Ikan
            </div>
            <Link to="/admin/produk" className="text-[11px] font-bold text-ocean-600 hover:underline mt-1 block">
              Kelola stok & harga →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-turquoise-50 text-turquoise-600 flex items-center justify-center font-bold">
            <Fish className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pelanggan */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pelanggan Terdaftar
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.total_customers || 0}
            </div>
            <Link to="/admin/pelanggan" className="text-[11px] font-bold text-ocean-600 hover:underline mt-1 block">
              Data akun pembeli →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Order Status Counters */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          Alur & Status Transaksi Pesanan
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center">
            <span className="text-xl font-black text-amber-700 block">
              {status_counts?.menunggu_pembayaran || 0}
            </span>
            <span className="text-[10px] font-bold text-amber-800 leading-tight block mt-1">
              Menunggu Bayar
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center relative">
            <span className="text-xl font-black text-sky-700 block">
              {status_counts?.menunggu_verifikasi || 0}
            </span>
            <span className="text-[10px] font-bold text-sky-800 leading-tight block mt-1">
              Verifikasi Bayar
            </span>
            {status_counts?.menunggu_verifikasi > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
            <span className="text-xl font-black text-blue-700 block">
              {status_counts?.pembayaran_diterima || 0}
            </span>
            <span className="text-[10px] font-bold text-blue-800 leading-tight block mt-1">
              Dana Diterima
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
            <span className="text-xl font-black text-indigo-700 block">
              {status_counts?.diproses || 0}
            </span>
            <span className="text-[10px] font-bold text-indigo-800 leading-tight block mt-1">
              Ikan Diproses
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
            <span className="text-xl font-black text-purple-700 block">
              {status_counts?.dikirim || 0}
            </span>
            <span className="text-[10px] font-bold text-purple-800 leading-tight block mt-1">
              Dalam Kirim
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xl font-black text-emerald-700 block">
              {status_counts?.selesai || 0}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 leading-tight block mt-1">
              Selesai
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-xl font-black text-rose-700 block">
              {status_counts?.dibatalkan || 0}
            </span>
            <span className="text-[10px] font-bold text-rose-800 leading-tight block mt-1">
              Dibatalkan
            </span>
          </div>

        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {low_stock_products?.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/90 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Peringatan: {low_stock_products.length} Produk Ikan Stok Menipis!</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Segera koordinasi dengan pembudidaya kolam Pasanggar untuk memperbarui stok: {low_stock_products.map(p => `${p.name} (sisa ${p.stock})`).join(', ')}.
              </p>
            </div>
          </div>
          <Link
            to="/admin/produk"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition"
          >
            Update Stok Produk
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pesanan Pelanggan Terbaru</h3>
            <p className="text-xs text-slate-400">Daftar transaksi masuk yang perlu ditindaklanjuti</p>
          </div>
          <Link
            to="/admin/pesanan"
            className="text-xs font-bold text-ocean-600 hover:underline flex items-center gap-1"
          >
            Lihat Semua Pesanan
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">No. Pesanan</th>
                <th className="px-4 py-3">Nama Pembeli</th>
                <th className="px-4 py-3">Waktu Transaksi</th>
                <th className="px-4 py-3">Total Belanja</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recent_orders?.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                    {ord.order_number}
                  </td>
                  <td className="px-4 py-3.5 font-medium">
                    {ord.customer_name}
                    <span className="block text-[10px] text-slate-400">{ord.customer_email}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{ord.created_at}</td>
                  <td className="px-4 py-3.5 font-extrabold text-ocean-700">
                    {ord.formatted_total}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-ocean-50 text-ocean-700 border border-ocean-100">
                      {ord.status_label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/admin/pesanan`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-ocean-50 hover:text-ocean-600 transition"
                    >
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
