import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  Clock, 
  FileCheck,
  XCircle,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview Image Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Reject Modal
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/payments', { params });
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load admin payments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleVerify = async (id, orderNumber) => {
    if (!confirm(`Verifikasi dan terima pembayaran untuk pesanan ${orderNumber}?`)) return;

    setProcessingId(id);
    try {
      const res = await api.post(`/admin/payments/${id}/verify`);
      if (res.data.success) {
        setMessage(res.data.message);
        await fetchPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memverifikasi pembayaran.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleOpenReject = (p) => {
    setRejectingPayment(p);
    setRejectionReason('Nominal transfer tidak sesuai atau bukti buram/tidak terbaca.');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingPayment) return;

    setProcessingId(rejectingPayment.id);
    try {
      const res = await api.post(`/admin/payments/${rejectingPayment.id}/reject`, {
        rejection_reason: rejectionReason,
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setRejectingPayment(null);
        await fetchPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak pembayaran.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Verifikasi Pembayaran Transfer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Periksa kecocokan bukti struk transfer pelanggan sebelum menyetujui proses persiapan ikan.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Semua Bukti Transfer' },
          { key: 'menunggu_verifikasi', label: 'Perlu Verifikasi (Pending)' },
          { key: 'diterima', label: 'Telah Diverifikasi (Diterima)' },
          { key: 'ditolak', label: 'Ditolak' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              statusFilter === tab.key
                ? 'bg-ocean-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">No. Pesanan & Pembeli</th>
                <th className="px-4 py-3.5">Bank & Rekening Pengirim</th>
                <th className="px-4 py-3.5">Nominal Transfer</th>
                <th className="px-4 py-3.5">Foto Struk</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Memuat data pembayaran...
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-slate-900 block text-xs">{p.order_number}</span>
                      <span className="text-[10px] text-slate-500">{p.customer_name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <strong className="text-slate-800">Bank {p.bank_name}</strong>
                      <span className="block text-[10px] text-slate-500">a.n. {p.account_name}</span>
                      {p.account_number && <span className="text-[10px] text-slate-400 font-mono">({p.account_number})</span>}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-ocean-700 text-sm">
                      {p.formatted_amount}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setPreviewImage(p.proof_image)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-ocean-50 text-slate-700 hover:text-ocean-700 font-bold text-[11px] transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Struk
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        p.status === 'diterima'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'ditolak'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'diterima' ? 'Terverifikasi' : p.status === 'ditolak' ? 'Ditolak' : 'Menunggu Verifikasi'}
                      </span>
                      {p.rejection_reason && (
                        <p className="text-[10px] text-rose-600 mt-1 max-w-xs">{p.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.status === 'menunggu_verifikasi' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify(p.id, p.order_number)}
                            disabled={processingId === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Terima
                          </button>
                          <button
                            onClick={() => handleOpenReject(p)}
                            disabled={processingId === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {p.status === 'diterima' ? 'Selesai Diverifikasi' : 'Sudah Ditolak'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Tidak ada data pembayaran pada status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Gambar Bukti */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Bukti Struk Transfer</h3>
              <button onClick={() => setPreviewImage(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[3/4] max-h-[70vh] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <img src={previewImage} alt="Bukti Transfer" className="w-full h-full object-contain" />
            </div>
            <div className="mt-4 text-center">
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-ocean-600 hover:underline inline-flex items-center gap-1"
              >
                Buka Gambar Penuh <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alasan Penolakan */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Tolak Bukti Pembayaran</h3>
              <button onClick={() => setRejectingPayment(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Pesanan <strong>{rejectingPayment.order_number}</strong> akan dikembalikan ke status 'Menunggu Pembayaran' dan pelanggan dapat mengunggah bukti baru.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Penolakan *</label>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingPayment.id}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
