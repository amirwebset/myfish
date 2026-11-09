import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Fish, ShieldCheck, Heart, MapPin, Award, Users, BookOpen } from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'IKANKU | Tentang Sentra Ikan Pasanggar';
  }, []);
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
            Tentang IKANKU
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Media Pemasaran Ikan Hias Desa Pasanggar
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Membangun ekosistem e-commerce modern untuk memberdayakan kelompok pembudidaya ikan hias air tawar lokal di Kabupaten Pamekasan.
          </p>
        </div>

        {/* Story Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Fish className="w-6 h-6 text-ocean-600" />
            Latar Belakang & Potensi Desa Pasanggar
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Desa Pasanggar, yang terletak di Kecamatan Pegantenan, Kabupaten Pamekasan, Madura, dianugerahi sumber daya air pegunungan yang jernih dan melimpah. Potensi geografis ini dimanfaatkan oleh masyarakat setempat untuk membudidayakan berbagai varietas ikan hias bernilai ekonomis tinggi, mulai dari Ikan Cupang hias (Halfmoon, Plakat), Koi lokal pilihan, Guppy eksotis, Mas Koki, hingga Channa dan Arwana.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sebelum adanya sistem ini, pemasaran ikan hias di Desa Pasanggar umumnya masih bergantung pada tengkulak konvensional atau penjualan tatap muka di pasar lokal. Platform <strong>IKANKU</strong> hadir sebagai solusi digital untuk menjembatani langsung para peternak lokal dengan konsumen dan pehobi ikan hias di seluruh wilayah Indonesia.
          </p>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-ocean-100 text-ocean-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Kualitas Standar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memastikan setiap ikan yang dipasarkan dalam kondisi sehat, melalui proses karantina, dan bergaransi hidup sampai di tangan pembeli.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-turquoise-100 text-turquoise-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Pemberdayaan Peternak</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Meningkatkan pendapatan asli para pembudidaya ikan dengan memangkas rantai distribusi panjang melalui transaksi daring terverifikasi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Riset Akademik</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dikembangkan sebagai luaran skripsi Teknik Informatika untuk menguji efektivitas web e-commerce berbasis React, Vite, dan Laravel REST API.
            </p>
          </div>
        </div>

        {/* Academic Attribution Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-ocean-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold text-turquoise-300 uppercase tracking-widest">
              Tugas Akhir / Skripsi Teknik Informatika
            </span>
            <h3 className="text-lg font-bold">
              Perancangan Website Penjualan Ikan Hias sebagai Media Pemasaran Produk di Desa Pasanggar
            </h3>
            <p className="text-xs text-slate-300">
              Arsitektur terpisah: Frontend React SPA (Vite) + Backend Laravel 10 REST API + Database MySQL.
            </p>
          </div>
          <Link
            to="/katalog"
            className="px-6 py-3 rounded-xl bg-turquoise-500 hover:bg-turquoise-600 text-slate-950 font-bold text-xs shrink-0 transition"
          >
            Lihat Katalog Ikan
          </Link>
        </div>

      </div>
    </div>
  );
}
