import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Fish, 
  ShieldCheck, 
  Truck, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  MapPin, 
  PhoneCall,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockProducts';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'IKANKU | Sentra Budidaya Ikan Hias Desa Pasanggar';
    const fetchData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/categories')
        ]);
        if (featRes.data?.success && Array.isArray(featRes.data.data) && featRes.data.data.length > 0) {
          setFeaturedProducts(featRes.data.data);
        } else {
          setFeaturedProducts(MOCK_PRODUCTS.filter(p => p.is_featured));
        }
        if (catRes.data?.success && Array.isArray(catRes.data.data) && catRes.data.data.length > 0) {
          setCategories(catRes.data.data);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch (err) {
        console.warn('Backend unavailable, using Pasanggar featured catalog:', err.message);
        setFeaturedProducts(MOCK_PRODUCTS.filter(p => p.is_featured));
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ocean-900 via-ocean-800 to-slate-900 text-white py-20 lg:py-28">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-turquoise-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-ocean-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-turquoise-300 border border-turquoise-400/30 backdrop-blur-md shadow-inner">
                <Sparkles className="w-4 h-4 text-turquoise-400" />
                <span>Media Pemasaran Digital Desa Pasanggar</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Ikan Hias Berkualitas dari <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-turquoise-300 via-ocean-300 to-white bg-clip-text text-transparent">
                  Desa Pasanggar
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
                Temukan Ikan Hias Favoritmu dari Desa Pasanggar. Didukung langsung oleh komunitas peternak lokal dengan jaminan kualitas sehat, warna cerah, dan garansi hidup sampai tujuan.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/katalog"
                  className="px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 shadow-xl shadow-turquoise-500/25 hover:shadow-turquoise-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Fish className="w-5 h-5" />
                  Jelajahi Ikan
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#unggulan"
                  className="px-7 py-4 rounded-xl text-base font-bold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md hover:-translate-y-0.5 transition-all"
                >
                  Lihat Produk Unggulan
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-700/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400">Garansi Hidup</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">6+</div>
                  <div className="text-xs text-slate-400">Varian Kategori</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Pamekasan</div>
                  <div className="text-xs text-slate-400">Peternak Lokal</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-800/60 backdrop-blur-md p-3 group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 relative">
                  <img
                    src="https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80"
                    alt="Ikan Koi Pasanggar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/default-fish.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-turquoise-500/90 text-white">
                      Koleksi Pilihan
                    </span>
                    <h3 className="text-lg font-bold mt-1">Ikan Koi Kohaku Premium</h3>
                    <p className="text-xs text-slate-300">Hasil sortiran indukan sehat petani Pasanggar</p>
                  </div>
                </div>

                {/* Floating Micro Card */}
                <div className="absolute -bottom-5 -left-5 bg-white text-slate-800 p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Packing Beroksigen</p>
                    <p className="text-[10px] text-slate-500">Tahan hingga 48 jam</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 2. KATEGORI IKAN HIAS */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 block mb-1">
                Koleksi Pilihan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Kategori Ikan Hias
              </h2>
            </div>
            <Link
              to="/katalog"
              className="text-sm font-bold text-ocean-600 hover:text-ocean-700 inline-flex items-center gap-1 mt-2 md:mt-0"
            >
              Lihat Semua Kategori
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/katalog?category=${cat.slug}`}
                className="group p-5 rounded-2xl border border-slate-200/90 hover:border-turquoise-400 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-ocean-100 group-hover:bg-gradient-to-tr group-hover:from-ocean-600 group-hover:to-turquoise-500 text-ocean-700 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm mb-3">
                  <Fish className="w-7 h-7 transform -rotate-12 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-ocean-600 transition-colors">
                  {cat.name}
                </h4>
                <span className="text-xs text-slate-500 mt-1">
                  {cat.products_count !== undefined ? `${cat.products_count} Produk` : 'Tersedia'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* 3. PRODUK UNGGULAN */}
      <section id="unggulan" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-turquoise-600 bg-turquoise-50 px-3 py-1 rounded-full border border-turquoise-200">
              Pilihan Peternak
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Ikan Hias Unggulan Desa Pasanggar
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Koleksi ikan hias dengan kondisi prima, warna menyala, dan siap dikirim dengan prosedur standar aman.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Fish className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">Belum ada produk unggulan yang ditampilkan.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-ocean-600 hover:bg-ocean-700 shadow-md shadow-ocean-600/20 hover:shadow-lg transition-all"
            >
              Lihat Seluruh Katalog ({featuredProducts.length}+ Ikan)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* 4. KEUNGGULAN BERBELANJA */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Kenapa Memilih IKANKU?
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Komitmen kami memberikan pengalaman belanja ikan hias online yang aman, terpercaya, dan memuaskan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-6 rounded-2xl bg-ocean-50/50 border border-ocean-100/80 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-ocean-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-ocean-600/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Garansi Hidup (DOA)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Garansi Death on Arrival. Apabila ikan mati dalam pengiriman, kami berikan penggantian ikan atau pengembalian sesuai kesepakatan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-turquoise-50/50 border border-turquoise-100/80 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-turquoise-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-turquoise-600/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Kualitas Pilihan Peternak</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ikan dirawat dan disortir langsung oleh peternak lokal berpengalaman di Desa Pasanggar dengan standar kesehatan yang baik.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-100/80 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-sky-600/20">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Pengemasan Beroksigen</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menggunakan plastik ganda khusus, tabung oksigen murni, dan kotak styrofoam tebal agar ikan tetap aman selama perjalanan ekspedisi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold mb-4 shadow-md shadow-slate-800/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Dukung Ekonomi Desa</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap transaksi yang Anda lakukan berkontribusi nyata memajukan ekonomi warga dan pembudidaya ikan di Desa Pasanggar, Pamekasan.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* 5. CARA PEMESANAN */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ocean-600">
              Langkah Mudah
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Cara Pemesanan di IKANKU
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Proses pembelian mudah dan transparan dari keranjang belanja hingga ikan sampai ke rumah Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 relative">
              <div className="w-9 h-9 rounded-full bg-ocean-100 text-ocean-700 font-extrabold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">Pilih Ikan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Telusuri katalog ikan hias kami, periksa spesifikasi dan ketersediaan stok, lalu klik Tambah ke Keranjang.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 relative">
              <div className="w-9 h-9 rounded-full bg-turquoise-100 text-turquoise-700 font-extrabold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">Isi Data & Checkout</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lengkapi alamat pengiriman penerima dan nomor kontak aktif untuk koordinasi kurir pengiriman.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 relative">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">Transfer & Bukti</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lakukan transfer ke rekening bank resmi IKANKU dan unggah foto bukti transfer langsung di website.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 relative">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-2">Verifikasi & Kirim</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Admin memverifikasi pembayaran Anda, ikan dipersiapkan dengan karantina singkat dan dikirim dengan no. resi pelacakan.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* 6. PROFIL SENTRA IKAN DESA PASANGGAR */}
      <section className="py-20 bg-gradient-to-tr from-ocean-900 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-turquoise-300 border border-white/20">
                <MapPin className="w-3.5 h-3.5" />
                Desa Pasanggar, Kec. Pegantenan, Kab. Pamekasan
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Sentra Budidaya Ikan Hias Desa Pasanggar
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Desa Pasanggar memiliki potensi budidaya ikan hias air tawar yang potensial dengan air sumber pegunungan yang jernih dan iklim yang cocok. Kehadiran website IKANKU dirancang sebagai media pemasaran digital guna memperluas jangkauan pasar para peternak lokal hingga ke luar daerah.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-turquoise-400 shrink-0" />
                  <span>Kemitraan langsung dengan kelompok pembudidaya ikan lokal.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-turquoise-400 shrink-0" />
                  <span>Transparansi harga dan stok riil langsung dari kolam budidaya.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-turquoise-400 shrink-0" />
                  <span>Karantina sebelum pengiriman untuk memastikan daya tahan ikan.</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/tentang"
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-turquoise-600 hover:bg-turquoise-700 transition"
                >
                  Pelajari Selengkapnya
                </Link>
                <Link
                  to="/kontak"
                  className="px-6 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition"
                >
                  Hubungi Pengelola
                </Link>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl aspect-[16/10] bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1544943910-4c1dc44a046c?auto=format&fit=crop&w=1000&q=80"
                alt="Budidaya Ikan Hias"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/default-fish.svg';
                }}
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
