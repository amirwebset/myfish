import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getWhatsAppUrl, DEFAULT_WA_NUMBER } from '../../utils/whatsapp';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleQuickSend = (topic) => {
    let msg = '';
    if (topic === 'stok') {
      msg = 'Halo Admin IKANKU Desa Pasanggar 👋, saya ingin bertanya stok ikan hias yang sedang ready stock dan siap kirim saat ini. Terima kasih!';
    } else if (topic === 'video') {
      msg = 'Halo Admin IKANKU Pasanggar 👋, bolehkah saya meminta rekaman video terkini dari ikan yang sedang saya minati di website?';
    } else if (topic === 'garansi') {
      msg = 'Halo Pengelola IKANKU 👋, saya ingin mengetahui lebih lanjut mengenai syarat klaim garansi 100% hidup (DOA) untuk pengiriman ke daerah saya.';
    } else {
      msg = customText || 'Halo Admin IKANKU Desa Pasanggar, saya butuh bantuan mengenai pemesanan ikan hias.';
    }

    window.open(getWhatsAppUrl(msg), '_blank');
    setIsOpen(false);
    setCustomText('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    window.open(getWhatsAppUrl(customText.trim()), '_blank');
    setIsOpen(false);
    setCustomText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      
      {/* Popover Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-fadeIn duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                  🐠
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></span>
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 leading-snug">
                  Peternak IKANKU Pasanggar
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  Online • Respon Cepat & Ramah
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Message */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-700 leading-relaxed shadow-sm">
              <p className="font-semibold text-slate-900 mb-1">Halo Sahabat Ikan Hias! 👋</p>
              Ada yang bisa kami bantu? Anda dapat menanyakan ketersediaan stok di kolam Desa Pasanggar, meminta video ikan hidup, atau konfirmasi ongkir kargo.
            </div>

            {/* Quick Topic Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilihan Pesan Cepat:
              </span>
              <button
                type="button"
                onClick={() => handleQuickSend('stok')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-medium transition flex items-center justify-between group"
              >
                <span>📦 Tanya stok ikan siap kirim</span>
                <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSend('video')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-medium transition flex items-center justify-between group"
              >
                <span>🎥 Minta video flaring / gerak aktif</span>
                <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSend('garansi')}
                className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-medium transition flex items-center justify-between group"
              >
                <span>🛡️ Konsultasi garansi 100% hidup (DOA)</span>
                <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition">→</span>
              </button>
            </div>
          </div>

          {/* Custom Message Input */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Tulis pesan ke WhatsApp..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
              disabled={!customText.trim()}
              title="Kirim ke WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/35 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-300"
        title="Hubungi Peternak via WhatsApp"
      >
        <span className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white animate-pulse"></span>
        </span>

        <span className="text-xs font-extrabold tracking-wide hidden sm:inline">
          Chat WhatsApp
        </span>
      </button>

    </div>
  );
}
