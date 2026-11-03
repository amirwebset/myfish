import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, Printer, Filter, TrendingUp, ShoppingBag, Fish } from 'lucide-react';
import api from '../../services/api';

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('all');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports', {
        params: { start_date: startDate, end_date: endDate, status }
      });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load sales report:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const { summary, orders, period } = reportData || {};

  return (
    <div className="space-y-6">
      
      {/* Header (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Laporan Penjualan Ikan Hias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekap omset penjualan, volume transaksi, dan detail komoditas ikan hias Desa Pasanggar per periode.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-ocean-600" />
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Filter Form (Hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm print:hidden">
        <form onSubmit={(e) => { e.preventDefault(); fetchReport(); }} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Transaksi</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
            >
              <option value="all">Semua Transaksi Sah (Lunas & Proses)</option>
              <option value="selesai">Hanya Selesai</option>
              <option value="dikirim">Sedang Dikirim</option>
              <option value="pembayaran_diterima">Pembayaran Diterima</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 transition"
            >
              Tampilkan Laporan
            </button>
          </div>
        </form>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-6">
        <h2 className="text-xl font-bold uppercase">Laporan Penjualan IKANKU</h2>
        <p className="text-xs">Sentra Budidaya Ikan Hias Desa Pasanggar, Kec. Pegantenan, Pamekasan</p>
        <p className="text-[11px] text-slate-500 mt-1">Periode: {period?.start_date} s/d {period?.end_date}</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Omset Periode
            </span>
            <div className="text-2xl font-black text-ocean-700">
              {summary?.formatted_revenue || 'Rp 0'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Pendapatan bersih tercatat</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Jumlah Transaksi
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.total_orders || 0} Pesanan
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Transaksi berhasil</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Volume Ikan Terjual
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.total_items_sold || 0} Ekor
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Terkirim ke pembeli</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-turquoise-50 text-turquoise-600 flex items-center justify-center font-bold">
            <Fish className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Orders Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">No. Pesanan</th>
                <th className="px-4 py-3.5">Waktu Transaksi</th>
                <th className="px-4 py-3.5">Nama Pembeli</th>
                <th className="px-4 py-3.5">Rincian Ikan Terjual</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Nilai Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Memuat laporan penjualan...
                  </td>
                </tr>
              ) : orders?.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {ord.order_number}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{ord.created_at}</td>
                    <td className="px-4 py-3.5 font-medium">{ord.recipient_name}</td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        {ord.items?.map((it, idx) => (
                          <span key={idx} className="block text-[11px] text-slate-600">
                            • {it.name} ({it.quantity}x)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ocean-50 text-ocean-700">
                        {ord.status_label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-ocean-700 text-sm">
                      {ord.formatted_total}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Tidak ada transaksi pada periode yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
