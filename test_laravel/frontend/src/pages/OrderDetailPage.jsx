import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle, 
  Package, 
  Truck, 
  ArrowLeft,
  XCircle,
  CreditCard,
  FileText
} from 'lucide-react';
import api from '../services/api';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment upload form
  const [bankName, setBankName] = useState('BCA');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [copiedBank, setCopiedBank] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderNumber}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setAmount(res.data.order.total_amount);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat rincian pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const handleCopy = (text, bankKey) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankKey);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPayment = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      alert('Silakan pilih foto bukti transfer terlebih dahulu.');
      return;
    }

    setUploading(true);
    setUploadSuccess('');
    setError('');

    const formData = new FormData();
    formData.append('bank_name', bankName);
    formData.append('account_name', accountName);
    formData.append('account_number', accountNumber);
    formData.append('amount', amount);
    formData.append('proof_image', proofFile);

    try {
      const res = await api.post(`/orders/${orderNumber}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUploadSuccess(res.data.message);
        await fetchOrder();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Stok ikan akan dikembalikan.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post(`/orders/${orderNumber}/cancel`);
      if (res.data.success) {
        await fetchOrder();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan pesanan.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Memuat data pesanan...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{error}</p>
        <Link
          to="/profil"
          className="px-6 py-2.5 rounded-xl bg-ocean-600 text-white font-bold text-sm inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Lihat Riwayat Pesanan
        </Link>
      </div>
    );
  }

  const bankAccounts = [
    { bank: 'BCA', no: '8295-0123-4567', name: 'Sentra Ikan Pasanggar' },
    { bank: 'Mandiri', no: '142-00-1928374-1', name: 'Sentra Ikan Pasanggar' },
    { bank: 'BRI', no: '0061-01-002345-53-8', name: 'Sentra Ikan Pasanggar' },
  ];

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Notification if fresh checkout */}
        {location.state?.newOrder && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Pesanan Berhasil Dibuat!</p>
              <p className="text-xs">
                Terima kasih telah berbelanja di IKANKU. Silakan lakukan transfer dan unggah bukti transfer di bawah ini.
              </p>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nomor Pesanan
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {order.order_number}
                </h1>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Dibuat pada: {order.created_at}
              </span>
            </div>

            {/* Status Badge */}
            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-ocean-50 text-ocean-700 border border-ocean-200">
                <Clock className="w-4 h-4" />
                {order.status_label}
              </span>
            </div>
          </div>

          {/* Tracking Number if shipped */}
          {order.tracking_number && (
            <div className="mt-4 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-sky-600" />
                <div>
                  <p className="font-bold">Pesanan Dalam Pengiriman</p>
                  <p className="text-xs text-sky-700">Nomor Resi: <strong className="font-mono text-sm">{order.tracking_number}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Recipient Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-400 block mb-1">Penerima</span>
              <p className="font-bold text-slate-800 text-sm">{order.recipient_name}</p>
              <p className="mt-0.5">{order.phone}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-bold text-slate-400 block mb-1">Alamat Tujuan</span>
              <p className="leading-relaxed text-slate-700">{order.address}</p>
              {order.notes && (
                <p className="mt-1 text-slate-500 italic">Catatan: "{order.notes}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-8 space-y-4">
          <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-ocean-600" />
            Daftar Ikan Dipesan
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
                      🐠
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.product_name}</h4>
                    <p className="text-xs text-slate-400">
                      {item.quantity} ekor x {item.formatted_price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-800">{item.formatted_subtotal}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-600">Total Tagihan</span>
            <span className="text-2xl font-black text-ocean-700">{order.formatted_total}</span>
          </div>
        </div>

        {/* Payment Transfer Section */}
        {order.status === 'menunggu_pembayaran' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
            
            {/* Bank Accounts Info */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-ocean-600" />
                <h3 className="text-base font-bold text-slate-900">Rekening Tujuan Transfer</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Silakan lakukan transfer sebesar <strong className="text-ocean-700 font-black">{order.formatted_total}</strong> ke salah satu rekening resmi berikut:
              </p>

              <div className="space-y-3">
                {bankAccounts.map((acc) => (
                  <div key={acc.bank} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-800 text-sm">Bank {acc.bank}</span>
                      <button
                        onClick={() => handleCopy(acc.no.replace(/-/g, ''), acc.bank)}
                        className="text-ocean-600 hover:text-ocean-700 font-bold flex items-center gap-1 text-[11px]"
                      >
                        {copiedBank === acc.bank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBank === acc.bank ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                    <div className="font-mono text-base font-bold text-slate-900 tracking-wider">
                      {acc.no}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">a.n. {acc.name}</div>
                  </div>
                ))}
              </div>

              {/* Cancel order button */}
              <div className="pt-2">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                >
                  {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan Ini'}
                </button>
              </div>
            </div>

            {/* Proof Upload Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Upload className="w-5 h-5 text-turquoise-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unggah Bukti Transfer</h3>
                  <p className="text-xs text-slate-400">Kirim foto bukti struk atau screenshot m-banking</p>
                </div>
              </div>

              {uploadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadPayment} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Pengirim *</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="BCA">BCA</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="BRI">BRI</option>
                      <option value="BNI">BNI</option>
                      <option value="BSI">BSI</option>
                      <option value="Lainnya">Bank Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening *</label>
                    <input
                      type="text"
                      required
                      placeholder="Atas nama pengirim"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Rekening Pengirim (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 1234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jumlah Ditransfer (Rp) *</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-ocean-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Foto Struk / Screenshot Transfer * (JPG, PNG, WebP maks 2MB)
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ocean-50 file:text-ocean-700 hover:file:bg-ocean-100"
                  />
                  {previewUrl && (
                    <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                      <img src={previewUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-turquoise-600 to-ocean-600 hover:from-turquoise-700 hover:to-ocean-700 shadow-lg shadow-turquoise-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Existing Payment Status Box */}
        {order.payment && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-ocean-600" />
              Status Verifikasi Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Status Verifikasi:</p>
                <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                  order.payment.status === 'diterima'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.payment.status === 'ditolak'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.payment.status === 'diterima'
                    ? 'Pembayaran Diterima & Terverifikasi'
                    : order.payment.status === 'ditolak'
                    ? 'Pembayaran Ditolak'
                    : 'Menunggu Verifikasi Administrator'}
                </span>

                {order.payment.rejection_reason && (
                  <p className="mt-2 text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    Alasan Penolakan: {order.payment.rejection_reason}
                  </p>
                )}

                <div className="mt-4 space-y-1 text-slate-600">
                  <p>Bank: <strong>{order.payment.bank_name}</strong></p>
                  <p>Atas Nama: <strong>{order.payment.account_name}</strong></p>
                  <p>Nominal: <strong>{order.payment.formatted_amount}</strong></p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 mb-2">Foto Bukti Terunggah:</p>
                <a
                  href={order.payment.proof_image}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-36 h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:opacity-90"
                >
                  <img
                    src={order.payment.proof_image}
                    alt="Bukti Transfer"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
