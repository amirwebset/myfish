import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = 'IKANKU | Kontak Kami & Layanan Pelanggan';
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
            Layanan Pelanggan
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hubungi Pengelola IKANKU
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Punya pertanyaan mengenai stok ikan hias, tata cara pemesanan, atau kemitraan peternak? Tim kami siap membantu Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-ocean-100 text-ocean-700 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Alamat Sentra Budidaya</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sentra Ikan Hias, Desa Pasanggar, Kec. Pegantenan, Kabupaten Pamekasan, Madura, Jawa Timur 69361
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-turquoise-100 text-turquoise-700 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">WhatsApp & Telepon</h4>
                <p className="text-xs text-slate-600 mt-1">
                  0812-3456-7890 (Customer Service)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Respon cepat via WhatsApp chat</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Email Resmi</h4>
                <p className="text-xs text-slate-600 mt-1">
                  info@pasanggarfish.com
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Kemitraan & Pertanyaan Akademik</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Jam Operasional Pelayanan</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Senin - Sabtu: 08.00 - 17.00 WIB
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Pemesanan online aktif 24 jam</p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ocean-600" />
              Kirim Pesan Langsung
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Silakan tulis pesan Anda di bawah ini. Tim pengelola akan membalas via email atau WhatsApp.
            </p>

            {sent && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pesan Anda telah berhasil dikirim! Pengelola kami akan segera merespon.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com / 0812..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjek Pesan *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Tanya stok cupang plakat"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Isi Pesan *</label>
                <textarea
                  required
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pertanyaan atau kebutuhan Anda secara lengkap..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-ocean-600 to-turquoise-600 hover:from-ocean-700 hover:to-turquoise-700 shadow-md shadow-ocean-600/20 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Kirim Pesan Sekarang
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
