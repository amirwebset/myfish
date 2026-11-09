# DOKUMEN ANALISIS SISTEM & CATATAN EVALUASI KEKURANGAN APLIKASI
## Sistem E-Commerce Budidaya Ikan Hias Desa Pasanggar ("IKANKU")

---

| Informasi Dokumen | Detail |
| :--- | :--- |
| **Nama Proyek** | IKANKU (Pasanggar Fish Market) |
| **Topik / Konteks** | Tugas Akhir (TA) / Skripsi Sistem E-Commerce Ikan Hias |
| **Arsitektur Sistem** | Decoupled Architecture (RESTful API Backend + Single Page Application Frontend) |
| **Tech Stack** | **Backend:** Laravel 10 (PHP 8.1+), Laravel Sanctum, MySQL<br>**Frontend:** React 19, React Router v7, Tailwind CSS 3, Vite, Axios |
| **Status Dokumen** | **Final Audit & System Gap Analysis** |

---

## 1. Eksekutif Ringkasan (Executive Summary)

Aplikasi **IKANKU** dirancang sebagai platform transaksi daring (*e-commerce*) yang memfasilitasi penjualan komoditas ikan hias hasil budidaya petani lokal Desa Pasanggar, Kecamatan Pegantenan, Kabupaten Pamekasan. Secara fungsional dasar (*MVP - Minimum Viable Product*), aplikasi telah berhasil mengimplementasikan alur umum:
1. Katalog dan pencarian ikan hias dengan filter kategori dan harga.
2. Keranjang belanja (*shopping cart*) berbasis *hybrid session* (mendukung *guest* dan *authenticated user*).
3. *Checkout* transaksi dengan penomoran unik otomatis (`ORD-YYYYMMDD-XXXXX`).
4. Unggah bukti pembayaran manual (*bank transfer proof*).
5. Panel Administrator lengkap (*Dashboard, Kelola Produk, Kelola Kategori, Kelola Pesanan, Verifikasi Pembayaran, Data Pelanggan, dan Laporan Penjualan*).

Namun, ditinjau dari kacamata **standar pengujian akademik Tugas Akhir (TA)**, **keamanan sistem informasi**, serta **karakteristik spesifik logistik hewan hidup (ikan hias)**, masih ditemukan sejumlah celah kritis, logika bisnis yang belum tertutup (*business logic flaws*), serta fitur-fitur esensial yang belum lengkap. 

Dokumen ini disusun untuk menguraikan secara rinci catatan kekurangan tersebut beserta rekomendasi solusi praktisnya.

---

## 2. Analisis Logika Bisnis & Fitur Spesifik Domain Ikan Hidup

Sebagai platform e-commerce yang memperdagangkan **hewan hidup air tawar**, aplikasi memerlukan perlakuan sistemik yang berbeda dari e-commerce barang mati (baju/elektronik). Berikut kekurangan pada aspek logika bisnis:

### 2.1. Ketiadaan Perhitungan Ongkos Kirim & Logistik Khusus (*Shipping Flaw*)
* **Kondisi Saat Ini:**
  Pada `CheckoutController::process`, nilai total transaksi hanya dihitung dari `subtotal` harga ikan:
  ```php
  $totalAmount += ($product->price * $item->quantity);
  ```
  Pada antarmuka frontend tertulis: *"Packing Oksigen & Box: Gratis (Standar Aman)"*.
* **Catatan Kekurangan:**
  1. Pengiriman ikan hidup memiliki batasan ketat: membutuhkan ekspedisi *Next Day Delivery / One Day Service* (seperti JNE YES, TIKI ONS, Paxel, atau Bus/Travel Antarkota Jawa-Madura).
  2. Ketiadaan modul ongkos kirim (baik tabel tarif manual berbasis kota/kabupaten maupun integrasi API seperti RajaOngkir) menyebabkan pembeli dari berbagai kota/pulau membayar harga yang sama tanpa biaya kirim.
  3. Biaya karantina ikan resmi (Balai Karantina Ikan, Pengendalian Mutu, dan Keamanan Hasil Perikanan - BKIPM) serta biaya tabung oksigen murni & box styrofoam tebal belum masuk dalam variabel perhitungan.
* **Rekomendasi Solusi:**
  - Tambahkan tabel `shipping_rates` (relasi ke kota tujuan) atau integrasi API RajaOngkir (Pos/JNE/TIKI).
  - Tambahkan komponen `shipping_cost` dan `packing_cost` ke dalam skema tabel `orders`.

---

### 2.2. Masalah Penahanan Stok Tanpa Batas Waktu (*Stock Lock / Abandoned Order*)
* **Kondisi Saat Ini:**
  Di `CheckoutController`, stok langsung dipotong saat pesanan dibuat:
  ```php
  $product->decrement('stock', $item->quantity);
  ```
* **Catatan Kekurangan:**
  1. Jika pelanggan menekan "Buat Pesanan" lalu **tidak pernah melakukan transfer** (pesanan ditinggalkan / *abandoned*), stok ikan akan berkurang selamanya dan berstatus "Stok Habis".
  2. Pelanggan lain yang benar-benar berniat membeli tidak dapat melakukan transaksi.
  3. Stok baru kembali jika pelanggan menekan "Batalkan" atau admin membatalkan manual. Ini membuka celah kompetitor atau akun palsu untuk "mengunci stok" (*denial of inventory*).
* **Rekomendasi Solusi:**
  - Tambahkan *expiration timestamp* pada pesanan (misal 1x24 jam atau 2 jam).
  - Buat Scheduled Task (Cron Job) Laravel:
    ```bash
    php artisan orders:cancel-expired
    ```
    yang otomatis membatalkan pesanan yang belum dibayar lewat tenggat waktu dan mengembalikan kuota stok produk (`increment('stock')`).

---

### 2.3. Sistem Pembayaran Manual Tanpa Kode Unik / Otomasi
* **Kondisi Saat Ini:**
  Pembayaran dilakukan secara transfer manual flat (misal Rp 170.000) dan admin harus mencocokkan mutasi bank secara visual dengan foto struk.
* **Catatan Kekurangan:**
  1. Jika terdapat 5 transaksi berbeda dengan nominal Rp 170.000 pada jam yang berdekatan, admin rentan salah mencocokkan mutasi bank.
  2. Rawan pemalsuan bukti transfer (struk palsu / *fake receipt generator*).
* **Rekomendasi Solusi:**
  - Tambahkan **3 digit kode acak unik** pada nominal pembayaran (misal `Rp 170.284`) yang disimpan di kolom `unique_code` tabel `orders`.
  - Atau, integrasikan Payment Gateway lokal seperti Midtrans, Xendit, atau Tripay (tersedia mode Sandbox) yang akan menjadi nilai tambah luar biasa dalam sidang skripsi.

---

### 2.4. Ketiadaan Fitur Garansi Kematian (*Dead On Arrival / DOA Claim*)
* **Kondisi Saat Ini:**
  Frontend menampilkan badge *"Garansi 100% Hidup Sampai Tujuan"*, tetapi tidak ada sistem pendukung klaim garansi di aplikasi.
* **Catatan Kekurangan:**
  - Jika ikan tiba dalam keadaan mati, pembeli tidak memiliki formulir resmi di aplikasi untuk mengajukan komplain dengan bukti video *unboxing* tanpa jeda (*uncut video*).
  - Alur pengembalian dana (*refund*) atau pengiriman ikan pengganti belum terdokumentasi di sistem.
* **Rekomendasi Solusi:**
  - Buat modul klaim garansi pada detail pesanan yang sudah berstatus `selesai` atau `dikirim`.
  - Sediakan form upload video / foto ikan mati beserta verifikasi admin.

---

### 2.5. Ketiadaan Sistem Ulasan & Penilaian Produk (*Review & Rating*)
* **Kondisi Saat Ini:**
  Setelah pesanan diselesaikan, tidak ada tombol untuk memberikan bintang (1-5) atau testimoni kepuasan.
* **Catatan Kekurangan:**
  - Pembelian ikan hias sangat bergantung pada reputasi kesehatan ikan dan keandalan packing. Ketiadaan review menurunkan kepercayaan pengguna baru (*social proof*).
  - Pada laporan TA, diagram use case biasanya menyertakan "Mengelola Ulasan / Memberikan Ulasan Produk".

---

## 3. Analisis Keamanan Sistem (*Security & Vulnerability Assessment*)

### 3.1. Penyimpanan Token Sanctum di `localStorage`
* **Temuan:**
  Di `frontend/src/context/AuthContext.jsx`:
  ```javascript
  localStorage.setItem('ikanku_token', res.data.token);
  ```
* **Risiko:**
  Token JWT / Sanctum yang tersimpan di `localStorage` dapat dibaca oleh skrip JavaScript apa pun. Jika terjadi serangan Cross-Site Scripting (XSS), token otentikasi admin atau pelanggan dapat dicuri (*session hijacking*).
* **Solusi Standar:**
  Gunakan Cookie dengan flag `HttpOnly; Secure; SameSite=Strict` yang disupport oleh Laravel Sanctum SPA Authentication (`Sanctum::actingAs` / SPA stateful domain).

---

### 3.2. Eksposur Data Bukti Transfer di Direktori Publik
* **Temuan:**
  Di `PaymentController::submit`:
  ```php
  $path = $request->file('proof_image')->store('payment_proofs', 'public');
  ```
  Bukti transfer diakses via:
  ```php
  asset('storage/' . $order->payment->proof_image)
  ```
* **Risiko:**
  Direktori `storage/app/public` di-symlink langsung ke `public/storage`. Siapa pun yang memiliki tautan gambar dapat melihat bukti transfer yang memuat informasi perbankan rahasia (nama pemilik rekening, nomor rekening, saldo/mutasi pengirim). Ini melanggar kepatuhan perlindungan data pribadi (UU PDP).
* **Solusi Standar:**
  Simpan file bukti transfer di disk `local` / non-publik (`storage/app/private_proofs/`), lalu buat rute controller khusus yang memvalidasi bahwa hanya pemilik pesanan atau admin yang dapat melihat berkas tersebut:
  ```php
  Route::get('/orders/{orderNumber}/proof', [PaymentController::class, 'viewProof'])->middleware('auth:sanctum');
  ```

---

### 3.3. Proteksi Rute Frontend (*Client-Side Route Guarding*)
* **Temuan:**
  Di `frontend/src/App.jsx`:
  ```jsx
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/profil" element={<ProfilePage />} />
  <Route path="/pesanan/:orderNumber" element={<OrderDetailPage />} />
  ```
  Rute-rute di atas tidak dibungkus oleh komponen pelindung `<ProtectedRoute>`. Proteksi baru dilakukan di dalam hook `useEffect` masing-masing halaman.
* **Dampak:**
  Terjadi *flicker* atau konten halaman ter-render sepersekian detik sebelum halaman dialihkan ke `/login`.
* **Solusi Standar:**
  Buat komponen pembungkus:
  ```jsx
  export default function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
    return children;
  }
  ```

---

### 3.4. Validasi & Kebijakan Kata Sandi
* **Temuan:**
  Di `AuthController::register`:
  ```php
  'password' => 'required|string|min:6|confirmed',
  ```
* **Kekurangan:**
  1. Batas 6 karakter terlalu pendek dan tanpa syarat angka/simbol.
  2. Belum ada fitur **"Lupa Password" / Reset Password**. Jika pengguna lupa password akunnya, tidak ada alur pemulihan selain meminta admin mengubahnya langsung di database.

---

## 4. Analisis Basis Data & Skema ERD (*Database Design*)

### 4.1. Ketiadaan Fitur *Soft Deletes* pada Entitas Master
* **Temuan:**
  Model `Product` dan `Category` menggunakan hard delete standar:
  ```php
  $product->delete();
  ```
* **Dampak pada Relasi:**
  Tabel `order_items` memiliki kolom `product_id`. Jika sebuah produk dihapus oleh admin di masa depan, relasi `$orderItem->product` akan bernilai `null`.
  - Pada halaman riwayat pesanan pelanggan atau laporan transaksi admin, foto dan data keterkaitan produk akan rusak / hilang.
* **Solusi:**
  Tambahkan trait `use SoftDeletes;` pada model `Product` dan `Category`, serta kolom `$table->softDeletes();` pada migration.

---

### 4.2. Ketiadaan Tabel Riwayat Perubahan Status (*Audit Trail / Order Logs*)
* **Temuan:**
  Tabel `orders` hanya memiliki satu kolom: `status` (bertipe `string` atau `enum`). Setiap kali admin memperbarui status, nilai lama langsung tertimpa.
* **Kekurangan Akademis (Poin Uji Sidang TA):**
  Dosen penguji sering menanyakan:
  > *"Bagaimana kita mengetahui kapan tepatnya status berubah dari 'pembayaran_diterima' menjadi 'diproses' atau 'dikirim'? Siapa admin yang mengubahnya jika admin lebih dari satu?"*
* **Solusi:**
  Buat tabel relasional `order_status_logs`:
  - `id`
  - `order_id` (FK)
  - `status`
  - `notes` (misal: "Ikan masuk karantina packing oksigen")
  - `changed_by` (FK user id)
  - `created_at`

---

### 4.3. Skema Data Alamat Pengiriman (*Address Normalization*)
* **Temuan:**
  Kolom `address` pada tabel `users` dan `orders` berupa kolom `text` tunggal bebas.
* **Kekurangan:**
  Format alamat tidak terstruktur menjadi komponen: Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan, dan Kode Pos. Ini menyulitkan integrasi otomatis dengan ekspedisi atau kalkulasi ongkos kirim.

---

## 5. Analisis Antarmuka & Frontend UX (*User Experience*)

| Lokasi Berkas | Komponen / Halaman | Catatan Kekurangan & Bug |
| :--- | :--- | :--- |
| `src/services/api.js` | Axios Client | **Hardcoded URL:** `API_BASE_URL = 'http://127.0.0.1:8000/api'`. Seharusnya membaca variabel lingkungan `import.meta.env.VITE_API_BASE_URL`. Jika di-deploy ke server/hosting, aplikasi akan error karena tetap memanggil localhost. |
| `src/pages/CatalogPage.jsx` | Katalog Produk | **UI Pagination Hilang:** Backend telah mengirimkan objek `meta` paginasi (`current_page, last_page, total`), namun di bagian bawah grid produk tidak ada tombol navigasi halaman (Prev / Next / Nomor Halaman). Produk setelah index ke-24 tidak dapat diakses pengguna. |
| `src/pages/admin/AdminOrdersPage.jsx` | Kelola Pesanan Admin | **Paginasi Tabel Belum Ada:** Backend membatasi `paginate(20)`. Jika pesanan melebihi 20 data, admin tidak memiliki tombol untuk melihat halaman 2, 3, dst. |
| `src/pages/admin/AdminProductsPage.jsx` | Kelola Produk Admin | **Paginasi Tabel Belum Ada:** Hanya menampilkan 20 produk pertama. Tidak ada pagination control di bawah tabel. |
| `src/pages/admin/AdminCustomersPage.jsx`| Data Pelanggan Admin | **Paginasi Tabel Belum Ada:** Sama halnya dengan tabel pelanggan, hanya 20 data pertama yang tampil. |
| `src/pages/admin/AdminReportsPage.jsx` | Laporan Penjualan | **Ketiadaan Grafik Tren Penjualan:** Laporan hanya berupa tabel dan kartu ringkasan angka. Tidak ada visualisasi grafik garis/batang (seperti Chart.js atau Recharts) untuk melihat tren fluktuasi omset mingguan/bulanan. |
| Seluruh Halaman Frontend | Tag Title & SEO | **Judul Halaman Statis:** Semua halaman memiliki document title default bawaan HTML template (`Vite + React + TS`). Belum dipasang dynamic document title (`IKANKU | Katalog`, `IKANKU | Detail Ikan`, dll.). |

---

## 6. Analisis Kualitas Kode & Praktik Terbaik (*Code Quality & Best Practices*)

### 6.1. Pemisahan Logika Controller (*Fat Controller vs Service Pattern*)
* Pada `CheckoutController` dan `PaymentController`, logika validasi, pemrosesan transaksi DB, manipulasi storage, dan pembuatan data digabung menjadi satu di method controller.
* **Saran TA:**
  Untuk mendapatkan nilai arsitektur perangkat lunak yang tinggi, pisahkan menjadi:
  - **FormRequest:** `App\Http\Requests\CheckoutRequest` untuk validasi input.
  - **Service Class:** `App\Services\OrderService` untuk menangani `DB::transaction` dan pemotongan stok.
  - **API Resource:** `App\Http\Resources\OrderResource` untuk memformat output JSON alih-alih me-mapping array secara manual di controller.

### 6.2. Penanganan Eksepsi & Logging
* Di `CheckoutController`:
  ```php
  catch (\Exception $e) {
      return response()->json([
          'success' => false,
          'message' => $e->getMessage(),
      ], 422);
  }
  ```
  Pesan error sistem langsung dikembalikan ke klien tanpa `Log::error($e)`. Jika terjadi kesalahan database fatal (misal SQL error), query mentah berisiko bocor ke frontend.

### 6.3. Asynchronous Jobs & Notifikasi
* Sistem e-commerce modern memerlukan notifikasi:
  - Email konfirmasi pesanan kepada pembeli.
  - Notifikasi kepada admin bahwa ada pesanan baru atau ada pembayaran baru yang menunggu verifikasi.
  - Saat ini, driver mailer di `.env` masih mengarah ke mailpit tanpa ada `Mailable` atau `Notification` class yang dipanggil saat checkout berhasil.

---

## 7. Matriks Prioritas Perbaikan (Roadmap Tindak Lanjut)

| Tingkat Prioritas | Item Pekerjaan | Modul Terdampak | Estimasi Dampak |
| :--- | :--- | :--- | :--- |
| **P1 - Kritis (Wajib untuk Sidang TA)** | **1. Komponen Paginasi di Frontend**<br>Pasang navigasi halaman (Next/Prev/Numbers) di Katalog dan semua tabel Admin. | Frontend (`CatalogPage`, `AdminOrdersPage`, dll.) | Menghilangkan batasan 20-24 data yang saat ini tersembunyi. |
| **P1 - Kritis (Wajib untuk Sidang TA)** | **2. Pembatalan Otomatis Pesanan Kedaluwarsa**<br>Cron job pembatalan pesanan `menunggu_pembayaran` setelah 1x24 jam untuk merilis stok kembali. | Backend (Console Command & Kernel Scheduler) | Mencegah stok terkunci permanen oleh pesanan yang tidak dibayar. |
| **P1 - Kritis (Wajib untuk Sidang TA)** | **3. Route Guarding Client-Side**<br>Bungkus rute `/checkout`, `/profil`, `/pesanan/:orderNumber` dengan `<ProtectedRoute>`. | Frontend (`App.jsx`, `ProtectedRoute.jsx`) | Menghindari flicker rendering halaman privat bagi pengguna guest. |
| **P1 - Kritis (Wajib untuk Sidang TA)** | **4. Konfigurasi Dynamic Environment Variable**<br>Ubah hardcoded URL di `api.js` menjadi `import.meta.env.VITE_API_BASE_URL`. | Frontend (`src/services/api.js`) | Menjamin aplikasi dapat di-deploy tanpa memecahkan koneksi API. |
| **P2 - Menengah (Standar Mutu Sistem)** | **5. Soft Deletes pada Master Data**<br>Terapkan `SoftDeletes` pada tabel `products` dan `categories`. | Backend (Migrations & Models) | Menjaga integritas data transaksi lampau saat produk dihapus. |
| **P2 - Menengah (Standar Mutu Sistem)** | **6. Ongkos Kirim & Packing Khusus**<br>Sediakan pilihan ongkos kirim berdasarkan kota/kabupaten serta biaya packing box styrofoam. | Backend & Frontend (`CheckoutPage`) | Menyesuaikan dengan realitas bisnis pengiriman hewan hidup. |
| **P2 - Menengah (Standar Mutu Sistem)** | **7. Proteksi Berkas Bukti Transfer**<br>Pindahkan file bukti transfer dari storage publik ke storage privat dengan otorisasi unduh. | Backend (`PaymentController`, Routes) | Melindungi data transaksi perbankan sensitif pelanggan. |
| **P2 - Menengah (Standar Mutu Sistem)** | **8. Visualisasi Grafik pada Laporan Admin**<br>Tambahkan chart garis tren pendapatan bulanan di `AdminReportsPage`. | Frontend (`AdminReportsPage.jsx`) | Memperkuat nilai visual dan analisis data dalam presentasi sidang. |
| **P3 - Tambahan (Penyempurnaan Lanjutan)** | **9. Sistem Ulasan Produk & Rating**<br>Form bintang dan komentar bagi pelanggan yang transaksinya telah `selesai`. | Backend & Frontend (`ProductDetailPage`) | Meningkatkan kepercayaan (*social proof*) pembeli baru. |
| **P3 - Tambahan (Penyempurnaan Lanjutan)** | **10. Integrasi Payment Gateway / Notifikasi**<br>Integrasi Midtrans Sandbox atau notifikasi WhatsApp/Email ke pembeli. | Backend | Nilai tambah (*distinction*) inovasi sistem. |

---

## 8. Panduan Langkah Perbaikan Teknis

Berikut adalah cuplikan kode solusi konkret untuk mengatasi 3 kekurangan paling mendesak:

### 8.1. Perbaikan Konfigurasi API Frontend (`src/services/api.js`)
Ubah baris ke-4:
```javascript
// SEBELUM (Hardcoded):
// const API_BASE_URL = 'http://127.0.0.1:8000/api';

// SESUDAH (Dinamis berbasis Environment Variable):
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
```
Dan buat berkas `.env` di folder `frontend/`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

### 8.2. Penambahan Cron Job Pembatalan Pesanan Kedaluwarsa di Backend
Buat command Artisan baru di Laravel:
```bash
php artisan make:command CancelExpiredOrders
```
Isi pada `app/Console/Commands/CancelExpiredOrders.php`:
```php
public function handle()
{
    // Cari pesanan yang belum dibayar lebih dari 24 jam
    $expiredOrders = Order::where('status', 'menunggu_pembayaran')
        ->where('created_at', '<', now()->subHours(24))
        ->get();

    foreach ($expiredOrders as $order) {
        DB::transaction(function () use ($order) {
            $order->status = 'dibatalkan';
            $order->notes = ($order->notes ? $order->notes . ' | ' : '') . 'Otomatis dibatalkan oleh sistem karena melewati batas waktu pembayaran 24 jam.';
            $order->save();

            // Kembalikan stok
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }
        });
    }

    $this->info("Berhasil membatalkan " . $expiredOrders->count() . " pesanan kedaluwarsa.");
}
```
Jadwalkan di `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('orders:cancel-expired')->hourly();
}
```

---

### 8.3. Pembuatan Komponen Proteksi Rute Frontend (`src/components/common/ProtectedRoute.jsx`)
```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Memeriksa sesi login...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```
Lalu di `App.jsx`, bungkus halaman yang memerlukan otentikasi:
```jsx
<Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
<Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
<Route path="/pesanan/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
```

---

## 9. Kesimpulan Analisis

Aplikasi **IKANKU** memiliki pondasi rancang bangun yang sudah rapi dan fungsional. Fitur-fitur transaksi inti, antarmuka admin, dan layout pengguna sudah didesain dengan baik dan bersih.

Namun demikian, perbaikan pada aspek **ongkos kirim & logistik ikan**, **pengembalian stok otomatis (*auto-cancellation*)**, **paginasi antarmuka**, dan **keamanan penyimpanan berkas privat** sangat disarankan untuk segera diselesaikan agar aplikasi tidak hanya siap untuk diujikan di hadapan dosen penguji Tugas Akhir, namun juga kokoh dan andal jika nantinya benar-benar dioperasikan oleh komunitas pembudidaya ikan hias Desa Pasanggar.

