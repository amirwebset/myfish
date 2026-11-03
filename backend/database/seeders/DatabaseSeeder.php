<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic demonstration data.
     */
    public function run(): void
    {
        // 1. Akun Pengguna Demo
        $admin = User::create([
            'name' => 'Administrator Pasanggar',
            'email' => 'admin@pasanggarfish.com',
            'phone' => '081234567890',
            'address' => 'Sentra Budidaya Ikan Hias, Desa Pasanggar, Kec. Pegantenan, Kab. Pamekasan, Jawa Timur',
            'role' => 'admin',
            'password' => Hash::make('admin123'),
        ]);

        $customer = User::create([
            'name' => 'Budi Santoso',
            'email' => 'pelanggan@gmail.com',
            'phone' => '082198765432',
            'address' => 'Jl. Ketintang Baru No. 12, Kel. Ketintang, Kec. Gayungan, Kota Surabaya, Jawa Timur 60231',
            'role' => 'customer',
            'password' => Hash::make('password123'),
        ]);

        $customer2 = User::create([
            'name' => 'Siti Rahmawati',
            'email' => 'siti@gmail.com',
            'phone' => '085712349988',
            'address' => 'Jl. Pahlawan No. 88, Pamekasan, Madura',
            'role' => 'customer',
            'password' => Hash::make('password123'),
        ]);

        // 2. Kategori Ikan Hias
        $catCupang = Category::create([
            'name' => 'Ikan Cupang',
            'slug' => 'ikan-cupang',
            'description' => 'Berbagai varian ikan cupang hias dengan sirip eksotis dan warna kontras dari peternak Desa Pasanggar.',
            'icon' => 'bi-water',
        ]);

        $catKoi = Category::create([
            'name' => 'Ikan Koi',
            'slug' => 'ikan-koi',
            'description' => 'Ikan koi pilihan dengan corak tajam, tubuh proporsional, dan cocok untuk kolam taman maupun aquarium besar.',
            'icon' => 'bi-droplet-half',
        ]);

        $catGuppy = Category::create([
            'name' => 'Ikan Guppy',
            'slug' => 'ikan-guppy',
            'description' => 'Ikan guppy strain murni dengan ekor lebar nan indah, mudah dirawat dan berkembang biak.',
            'icon' => 'bi-stars',
        ]);

        $catKoki = Category::create([
            'name' => 'Ikan Mas Koki',
            'slug' => 'ikan-mas-koki',
            'description' => 'Ikan mas koki lucu dengan jambul mengembang dan gerakan gemulai untuk mempercantik ruang tamu.',
            'icon' => 'bi-heart-pulse',
        ]);

        $catMolly = Category::create([
            'name' => 'Ikan Molly & Platy',
            'slug' => 'ikan-molly-platy',
            'description' => 'Ikan hias air tawar berukuran mini yang ramah lingkungan, aktif, dan cocok untuk aquascape.',
            'icon' => 'bi-circle-half',
        ]);

        $catPredator = Category::create([
            'name' => 'Ikan Predator & Eksotis',
            'slug' => 'ikan-predator-eksotis',
            'description' => 'Koleksi ikan eksotis berkarakter kuat seperti Arwana dan Channa dengan kualitas grade pilihan.',
            'icon' => 'bi-shield-shaded',
        ]);

        // 3. Produk Ikan Hias (Data Demonstrasi)
        $products = [
            [
                'category_id' => $catCupang->id,
                'name' => 'Ikan Cupang Halfmoon Blue Rim [Demo]',
                'slug' => 'ikan-cupang-halfmoon-blue-rim',
                'description' => 'Ikan Cupang Halfmoon Blue Rim kualitas kontes dari pembudidaya Desa Pasanggar. Memiliki bukaan ekor 180 derajat sempurna, warna tubuh putih bersih dengan rim biru pekat di ujung sirip. Kondisi sehat lincah, mental fighter aktif.',
                'price' => 85000,
                'stock' => 15,
                'image' => 'https://images.unsplash.com/photo-1544943910-4c1dc44a046c?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catCupang->id,
                'name' => 'Ikan Cupang Plakat Multicolor Fancy [Demo]',
                'slug' => 'ikan-cupang-plakat-multicolor-fancy',
                'description' => 'Ikan Cupang Plakat Multicolor dengan corak warna artistik merah, biru, hitam, dan kuning. Sirip tebal dan kokoh, form tubuh rapat, pakan pelet dan jentik nyamuk lahap.',
                'price' => 65000,
                'stock' => 20,
                'image' => 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catKoi->id,
                'name' => 'Ikan Koi Kohaku Premium 25cm [Demo]',
                'slug' => 'ikan-koi-kohaku-premium-25cm',
                'description' => 'Ikan Koi varietas Kohaku ukuran 25 cm dengan pola merah (Hi) menyala dan dasar putih (Shiroji) seputih salju. Garis pola seimbang dua langkah (Nidan), sisik berkilau sehat.',
                'price' => 220000,
                'stock' => 8,
                'image' => 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catKoi->id,
                'name' => 'Ikan Koi Showa Sanshoku Blitar Line [Demo]',
                'slug' => 'ikan-koi-showa-sanshoku-blitar-line',
                'description' => 'Ikan Koi Showa Sanshoku dengan perpaduan warna hitam legam (Sumi), merah pekat, dan putih bersih. Memiliki pola Menware khas di area kepala dan Motoguro di sirip dada.',
                'price' => 260000,
                'stock' => 6,
                'image' => 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catGuppy->id,
                'name' => 'Ikan Guppy Albino Full Red (AFR) Sepasang [Demo]',
                'slug' => 'ikan-guppy-albino-full-red-sepasang',
                'description' => 'Sepasang indukan Ikan Guppy Albino Full Red (AFR) strain murni berumur 3,5 bulan. Mata merah tembus, warna merah menyelimuti seluruh tubuh hingga sirip dorsal lebar. Siap kawin dan beranak.',
                'price' => 50000,
                'stock' => 25,
                'image' => 'https://images.unsplash.com/photo-1576836165612-8bc9b07e7778?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catGuppy->id,
                'name' => 'Ikan Guppy Blue Dragon Trio [Demo]',
                'slug' => 'ikan-guppy-blue-dragon-trio',
                'description' => 'Paket Trio Guppy Blue Dragon (1 Jantan + 2 Betina). Warna biru safir metalik dengan corak dragon scale pada bagian punggung. Sangat anggun berenang di aquascape.',
                'price' => 70000,
                'stock' => 14,
                'image' => 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catKoki->id,
                'name' => 'Ikan Mas Koki Oranda Red Cap Grade A [Demo]',
                'slug' => 'ikan-mas-koki-oranda-red-cap-grade-a',
                'description' => 'Ikan Mas Koki varietas Oranda Red Cap dengan jambul merah merekah di atas kepala dan tubuh putih bersih. Bentuk tubuh membulat lucu (chubby) dengan sirip ekor ganda menjuntai indah.',
                'price' => 95000,
                'stock' => 12,
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catKoki->id,
                'name' => 'Ikan Mas Koki Ranchu Calico [Demo]',
                'slug' => 'ikan-mas-koki-ranchu-calico',
                'description' => 'Ikan Mas Koki Ranchu tanpa sirip punggung dengan kelengkungan punggung proporsional dan kepala bertekstur. Corak Calico 3 warna (hitam, jingga, perak). Peliharaan favorit penggemar goldfish.',
                'price' => 135000,
                'stock' => 9,
                'image' => 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catMolly->id,
                'name' => 'Ikan Molly Balon Marmer Marble 5 Ekor [Demo]',
                'slug' => 'ikan-molly-balon-marmer-5-ekor',
                'description' => 'Paket 5 ekor Ikan Molly Balon dengan corak totol hitam putih marmer yang menggemaskan. Perut bulat khas, sangat jinak, dan membantu memakan alga lumut di kaca akuarium.',
                'price' => 30000,
                'stock' => 35,
                'image' => 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catPredator->id,
                'name' => 'Ikan Arwana Silver Red Tail 20cm [Demo]',
                'slug' => 'ikan-arwana-silver-red-tail-20cm',
                'description' => 'Ikan Arwana Silver Red Tail berukuran 20 cm. Sisik mengkilap platinum dengan rona kemerahan di sirip ekor bawah. Dayung panjang, kumis sempurna tidak cacat, nafsu makan jangkrik dan ulat hongkong tinggi.',
                'price' => 450000,
                'stock' => 5,
                'image' => 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'category_id' => $catPredator->id,
                'name' => 'Ikan Channa Marulioides Yellow Sentarum [Demo]',
                'slug' => 'ikan-channa-marulioides-yellow-sentarum',
                'description' => 'Ikan Channa Maru Yellow Sentarum size 15 cm. Bunga dan bar cabung sudah bermunculan rapi, mental bar-bar, aktif flaring di kaca akuarium. Sangat dicari para pecinta snakehead.',
                'price' => 280000,
                'stock' => 7,
                'image' => 'https://images.unsplash.com/photo-1520637736862-4d197d1e893e?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'category_id' => $catPredator->id,
                'name' => 'Ikan Louhan Kamfa F2 Mutiara Mewah [Demo]',
                'slug' => 'ikan-louhan-kamfa-f2-mutiara-mewah',
                'description' => 'Ikan Louhan Kamfa F2 jenong air menonjol, mutiara silang rapi melingkari seluruh badan hingga sirip, ekor wrap lebar, warna dasar merah merona cerah.',
                'price' => 380000,
                'stock' => 4,
                'image' => 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        $createdProducts = [];
        foreach ($products as $prodData) {
            $createdProducts[] = Product::create($prodData);
        }

        // 4. Buat Contoh Pesanan Nyata untuk Demo (Menunjukkan Siklus Transaksi E-Commerce Lengkap)
        
        // Pesanan 1: Menunggu Verifikasi Pembayaran (Dilengkapi Bukti Transfer)
        $order1 = Order::create([
            'order_number' => 'ORD-20261024-0001',
            'user_id' => $customer->id,
            'recipient_name' => 'Budi Santoso',
            'phone' => '082198765432',
            'address' => 'Jl. Ketintang Baru No. 12, Surabaya, Jawa Timur 60231',
            'notes' => 'Tolong berikan oksigen ekstra dan packing styrofoam tebal ya min.',
            'total_amount' => 170000,
            'payment_method' => 'bank_transfer',
            'status' => 'menunggu_verifikasi',
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $createdProducts[0]->id,
            'product_name' => $createdProducts[0]->name,
            'product_price' => $createdProducts[0]->price,
            'quantity' => 2,
            'subtotal' => 170000,
        ]);

        Payment::create([
            'order_id' => $order1->id,
            'bank_name' => 'Bank Mandiri',
            'account_name' => 'Budi Santoso',
            'account_number' => '1420019283746',
            'amount' => 170000,
            'proof_image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            'notes' => 'Sudah ditransfer melalui Mandiri Livin pukul 14:30 WIB.',
            'status' => 'menunggu_verifikasi',
        ]);

        // Pesanan 2: Pembayaran Diterima / Diproses
        $order2 = Order::create([
            'order_number' => 'ORD-20261023-0002',
            'user_id' => $customer2->id,
            'recipient_name' => 'Siti Rahmawati',
            'phone' => '085712349988',
            'address' => 'Jl. Pahlawan No. 88, Pamekasan, Madura',
            'notes' => 'Antar jam sore setelah jam kerja.',
            'total_amount' => 220000,
            'payment_method' => 'bank_transfer',
            'status' => 'diproses',
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $createdProducts[2]->id,
            'product_name' => $createdProducts[2]->name,
            'product_price' => $createdProducts[2]->price,
            'quantity' => 1,
            'subtotal' => 220000,
        ]);

        Payment::create([
            'order_id' => $order2->id,
            'bank_name' => 'BCA',
            'account_name' => 'Siti Rahmawati',
            'account_number' => '8291038475',
            'amount' => 220000,
            'proof_image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            'notes' => 'Transfer via BCA Mobile.',
            'status' => 'diterima',
            'verified_at' => now(),
            'verified_by' => $admin->id,
        ]);

        // Pesanan 3: Selesai
        $order3 = Order::create([
            'order_number' => 'ORD-20261020-0003',
            'user_id' => $customer->id,
            'recipient_name' => 'Budi Santoso',
            'phone' => '082198765432',
            'address' => 'Jl. Ketintang Baru No. 12, Surabaya, Jawa Timur 60231',
            'notes' => 'Packing standar.',
            'total_amount' => 95000,
            'payment_method' => 'bank_transfer',
            'status' => 'selesai',
            'tracking_number' => 'JNT-IKAN-982310293',
        ]);

        OrderItem::create([
            'order_id' => $order3->id,
            'product_id' => $createdProducts[6]->id,
            'product_name' => $createdProducts[6]->name,
            'product_price' => $createdProducts[6]->price,
            'quantity' => 1,
            'subtotal' => 95000,
        ]);

        Payment::create([
            'order_id' => $order3->id,
            'bank_name' => 'BRI',
            'account_name' => 'Budi Santoso',
            'account_number' => '0019283746501',
            'amount' => 95000,
            'proof_image' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            'notes' => 'Transfer BRImo.',
            'status' => 'diterima',
            'verified_at' => now()->subDays(3),
            'verified_by' => $admin->id,
        ]);
    }
}
