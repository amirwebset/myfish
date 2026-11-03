import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Truck, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../../services/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Detail & Status Edit Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/orders', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load admin orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleOpenDetail = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      if (res.data.success) {
        setSelectedOrder(res.data.order);
        setNewStatus(res.data.order.status);
        setTrackingNumber(res.data.order.tracking_number || '');
        setError('');
      }
    } catch (err) {
      alert('Gagal memuat rincian pesanan.');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    setError('');

    try {
      const res = await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        tracking_number: trackingNumber,
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setSelectedOrder(null);
        await fetchOrders();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const statuses = [
    { value: 'all', label: 'Semua Status' },
    { value: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
    { value: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
    { value: 'pembayaran_diterima', label: 'Pembayaran Diterima' },
    { value: 'diproses', label: 'Sedang Diproses' },
    { value: 'dikirim', label: 'Dalam Pengiriman' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Kelola Pesanan Pelanggan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau status pesanan, update progres kemasan karantina, dan masukkan nomor resi ekspedisi.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. pesanan atau nama penerima..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">No. Pesanan</th>
                <th className="px-4 py-3.5">Penerima & Alamat</th>
                <th className="px-4 py-3.5">Waktu Transaksi</th>
                <th className="px-4 py-3.5">Total Belanja</th>
                <th className="px-4 py-3.5">Status Pesanan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Memuat daftar pesanan...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {ord.order_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block text-xs">{ord.recipient_name}</span>
                      <span className="text-[10px] text-slate-400 block max-w-xs truncate">{ord.address}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{ord.created_at}</td>
                    <td className="px-4 py-3.5 font-extrabold text-ocean-700 text-sm">
                      {ord.formatted_total}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-ocean-50 text-ocean-700 border border-ocean-100">
                        {ord.status_label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-ocean-700 bg-ocean-50 hover:bg-ocean-100 transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail & Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Update Status */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Detail Transaksi</span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
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

            <div className="space-y-5 text-xs">
              
              {/* Customer & Address Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-400 block mb-0.5">Penerima & Kontak</span>
                  <p className="font-bold text-slate-800 text-sm">{selectedOrder.recipient_name}</p>
                  <p className="text-slate-600 mt-0.5">{selectedOrder.phone}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block mb-0.5">Alamat Pengiriman</span>
                  <p className="text-slate-700 leading-relaxed">{selectedOrder.address}</p>
                  {selectedOrder.notes && (
                    <p className="text-slate-500 italic mt-1">Catatan: {selectedOrder.notes}</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Ikan yang Dipesan:</h4>
                <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {it.image_url && (
                          <img src={it.image_url} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{it.product_name}</p>
                          <p className="text-slate-400 text-[11px]">{it.quantity} ekor x {it.formatted_price}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{it.formatted_subtotal}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-baseline pt-2 px-1">
                  <span className="font-bold text-slate-500">Total Transaksi:</span>
                  <span className="text-lg font-black text-ocean-700">{selectedOrder.formatted_total}</span>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Perbarui Status Transaksi</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Alur *</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                    >
                      <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                      <option value="menunggu_verifikasi">Menunggu Verifikasi Pembayaran</option>
                      <option value="pembayaran_diterima">Pembayaran Diterima</option>
                      <option value="diproses">Sedang Diproses (Karantina / Packing)</option>
                      <option value="dikirim">Dalam Pengiriman</option>
                      <option value="selesai">Pesanan Selesai</option>
                      <option value="dibatalkan">Batalkan Pesanan (Stok Kembali)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Resi Pengiriman</label>
                    <input
                      type="text"
                      placeholder="Contoh: JNE-88291039812"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 rounded-xl font-bold text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 disabled:opacity-50"
                  >
                    {updating ? 'Memperbarui...' : 'Simpan Perubahan Status'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
