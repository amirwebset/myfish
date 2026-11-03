import React from 'react';
import { Link } from 'react-router-dom';
import { Fish, MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-500 to-turquoise-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
                <Fish className="w-5 h-5 -rotate-12" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">IKANKU</span>
                <span className="block text-[10px] font-bold text-ocean-400 tracking-wider uppercase">
                  Desa Pasanggar
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform e-commerce resmi pemasaran ikan hias budidaya peternak lokal Desa Pasanggar, Kec. Pegantenan, Kab. Pamekasan. Menyediakan aneka ikan hias berkualitas dengan jaminan garansi hidup sampai tujuan.
            </p>
            <div className="flex items-center gap-2 text-xs text-turquoise-400 font-semibold bg-turquoise-950/40 p-2.5 rounded-lg border border-turquoise-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Garansi 100% Hidup (Death on Arrival)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-ocean-400 transition">Beranda</Link>
              </li>
              <li>
                <Link to="/katalog" className="hover:text-ocean-400 transition">Katalog Ikan Hias</Link>
              </li>
              <li>
                <Link to="/tentang" className="hover:text-ocean-400 transition">Tentang Desa Pasanggar</Link>
              </li>
              <li>
                <Link to="/kontak" className="hover:text-ocean-400 transition">Kontak & Lokasi</Link>
              </li>
              <li>
                <Link to="/profil" className="hover:text-ocean-400 transition">Akun & Riwayat Pesanan</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Kategori Populer</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/katalog?category=ikan-cupang" className="hover:text-ocean-400 transition">Ikan Cupang Hias</Link>
              </li>
              <li>
                <Link to="/katalog?category=ikan-koi" className="hover:text-ocean-400 transition">Ikan Koi Premium</Link>
              </li>
              <li>
                <Link to="/katalog?category=ikan-guppy" className="hover:text-ocean-400 transition">Ikan Guppy Eksotis</Link>
              </li>
              <li>
                <Link to="/katalog?category=ikan-mas-koki" className="hover:text-ocean-400 transition">Ikan Mas Koki</Link>
              </li>
              <li>
                <Link to="/katalog?category=ikan-predator-eksotis" className="hover:text-ocean-400 transition">Arwana & Channa</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wide">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-ocean-400 shrink-0 mt-0.5" />
                <span>Sentra Ikan Hias, Desa Pasanggar, Kec. Pegantenan, Kab. Pamekasan, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-turquoise-400 shrink-0" />
                <span>WhatsApp: 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-coral-500 shrink-0" />
                <span>info@pasanggarfish.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Academic Attribution */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 IKANKU — Website Penjualan Ikan Hias Desa Pasanggar. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Dirancang untuk Skripsi Teknik Informatika</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            <span>Universitas Trunojoyo Madura / TA Pasanggar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
