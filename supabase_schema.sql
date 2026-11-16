-- ==============================================================================
-- IKANKU (Ikan Hias Desa Pasanggar) - Database Schema & Initial Data for Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABEL: PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    whatsapp VARCHAR(30),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL: PRODUCTS (Katalog Ikan Hias Desa Pasanggar)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    breeder VARCHAR(255),
    size VARCHAR(50),
    age VARCHAR(50),
    gender VARCHAR(50),
    care_level VARCHAR(50),
    feed TEXT,
    water_param TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABEL: ORDERS (Transaksi Pesanan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    notes TEXT,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    order_status VARCHAR(50) DEFAULT 'menunggu_konfirmasi' CHECK (order_status IN ('menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
    payment_status VARCHAR(50) DEFAULT 'menunggu_pembayaran' CHECK (payment_status IN ('menunggu_pembayaran', 'menunggu_verifikasi', 'lunas', 'ditolak')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABEL: ORDER_ITEMS (Item Detail Pesanan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. KEAMANAN DATA (ROW LEVEL SECURITY / RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
DROP POLICY IF EXISTS "Public can view own profile" ON public.profiles;
CREATE POLICY "Public can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- POLICIES: PRODUCTS (Publik boleh melihat, frontend/admin dapat CRUD)
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Admin full access products" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow anon manage products" ON public.products;

CREATE POLICY "Allow public read products" ON public.products
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow anon manage products" ON public.products
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- POLICIES: ORDERS (Siapapun boleh buat pesanan, pembeli & admin dapat membaca & update status)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users and admin can read orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update orders" ON public.orders;

CREATE POLICY "Allow insert orders" ON public.orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow read orders" ON public.orders
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow update orders" ON public.orders
    FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- POLICIES: ORDER_ITEMS
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Order items readable" ON public.order_items;
DROP POLICY IF EXISTS "Allow insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow read order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow manage order items" ON public.order_items;

CREATE POLICY "Allow insert order items" ON public.order_items
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow read order items" ON public.order_items
    FOR SELECT USING (TRUE);

CREATE POLICY "Allow manage order items" ON public.order_items
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ==============================================================================
-- 7. FUNCTION: ATUR PENGURANGAN STOK OTOMATIS (MENCEGAH STOK MINUS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.reduce_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id AND stock >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Stok ikan tidak mencukupi untuk pesanan ini.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 8. DATA AWAL: 12 IKAN HIAS SENTRA BUDIDAYA DESA PASANGGAR
-- ==============================================================================
INSERT INTO public.products (
    name, slug, category, description, price, stock, image_url, breeder, size, age, gender, care_level, feed, water_param, is_featured, is_active
) VALUES 
(
    'Ikan Cupang Halfmoon Blue Rim [Pasanggar]',
    'ikan-cupang-halfmoon-blue-rim',
    'Ikan Cupang',
    'Ikan Cupang Halfmoon Blue Rim kualitas kontes dari pembudidaya Desa Pasanggar. Memiliki bukaan ekor 180 derajat sempurna, warna tubuh putih bersih dengan rim biru pekat di ujung sirip. Kondisi sehat lincah, mental fighter aktif.',
    85000,
    15,
    'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80',
    'Kelompok Tani Tirta Pasanggar (Dusun Sumber, Pasanggar)',
    'Size M (4.5 - 5.0 cm)',
    '3.5 Bulan',
    'Jantan (Male)',
    'Mudah (Pemula)',
    'Jentik nyamuk, pelet micro, kutu air',
    'Suhu 26-29°C • pH 6.5 - 7.2 (Air Tawar Endapan)',
    TRUE,
    TRUE
),
(
    'Ikan Cupang Plakat Multicolor Fancy',
    'ikan-cupang-plakat-multicolor-fancy',
    'Ikan Cupang',
    'Ikan Cupang Plakat Multicolor dengan corak warna artistik merah, biru, hitam, dan kuning. Sirip tebal dan kokoh, form tubuh rapat, pakan pelet dan jentik nyamuk sangat lahap.',
    65000,
    20,
    'https://images.unsplash.com/photo-1548262323-694280fdc967?auto=format&fit=crop&w=800&q=80',
    'Pak Hasanudin - Sentra Cupang Pasanggar Barat',
    'Size S+ (4.0 cm)',
    '3 Bulan',
    'Jantan (Male)',
    'Mudah (Pemula)',
    'Pelet cupang, cacing sutra, artemia',
    'Suhu 25-28°C • pH 6.8 - 7.4',
    TRUE,
    TRUE
),
(
    'Ikan Koi Kohaku Premium 25cm',
    'ikan-koi-kohaku-premium-25cm',
    'Ikan Koi',
    'Ikan Koi varietas Kohaku ukuran 25 cm dengan pola merah (Hi) menyala dan dasar putih (Shiroji) seputih salju. Garis pola seimbang dua langkah (Nidan), sisik berkilau sehat.',
    220000,
    8,
    'https://images.unsplash.com/photo-1570002331992-2061565c3556?auto=format&fit=crop&w=800&q=80',
    'Kolam Budidaya Tirta Sejahtera Pasanggar',
    '25 cm',
    '7 Bulan',
    'Campur (Unsexed)',
    'Menengah (Kolam/Akuarium Besar)',
    'Pelet koi spirulina & gandum',
    'Suhu 22-26°C • pH 7.0 - 8.0 (Aerasi Kuat)',
    TRUE,
    TRUE
),
(
    'Ikan Koi Showa Sanshoku Blitar Line',
    'ikan-koi-showa-sanshoku-blitar-line',
    'Ikan Koi',
    'Ikan Koi Showa Sanshoku dengan perpaduan warna hitam legam (Sumi), merah pekat, dan putih bersih. Memiliki pola Menware khas di area kepala dan Motoguro di sirip dada.',
    260000,
    6,
    'https://images.unsplash.com/photo-1509587961360-de7aff9a662a?auto=format&fit=crop&w=800&q=80',
    'Kolam Budidaya Tirta Sejahtera Pasanggar',
    '28 cm',
    '8 Bulan',
    'Campur (Unsexed)',
    'Menengah',
    'Pelet pertumbuhan & warna',
    'Suhu 22-26°C • pH 7.2 - 7.8',
    FALSE,
    TRUE
),
(
    'Ikan Guppy Albino Full Red (AFR) Sepasang',
    'ikan-guppy-albino-full-red-sepasang',
    'Ikan Guppy',
    'Sepasang indukan Ikan Guppy Albino Full Red (AFR) strain murni berumur 3,5 bulan. Mata merah tembus, warna merah menyelimuti seluruh tubuh hingga sirip dorsal lebar. Siap kawin dan beranak.',
    50000,
    25,
    'https://upload.wikimedia.org/wikipedia/commons/e/e7/Guppy_-_Poecilia_reticulata.jpg',
    'Peternak Guppy Pasanggar Timur (Mas Faiz)',
    'Dewasa Siap Pijah (Pair)',
    '3.5 Bulan',
    'Sepasang (1 Jantan + 1 Betina)',
    'Sangat Mudah (Pemula & Aquascape)',
    'Pelet halus, cacing beku, kutu air',
    'Suhu 24-28°C • pH 6.8 - 7.5',
    TRUE,
    TRUE
),
(
    'Ikan Guppy Blue Dragon Trio',
    'ikan-guppy-blue-dragon-trio',
    'Ikan Guppy',
    'Paket Trio Guppy Blue Dragon (1 Jantan + 2 Betina). Warna biru safir metalik dengan corak dragon scale pada bagian punggung. Sangat anggun berenang di aquascape.',
    70000,
    14,
    'https://upload.wikimedia.org/wikipedia/commons/c/c0/Poecilia_reticulata_-_Guppy%2C_male%2C_cobra-green_morph.jpg',
    'Peternak Guppy Pasanggar Timur (Mas Faiz)',
    'Indukan Trio',
    '3.5 Bulan',
    'Trio (1 Jantan + 2 Betina Hamil Muda)',
    'Sangat Mudah (Pemula)',
    'Pelet bubuk, cacing sutra',
    'Suhu 24-28°C • pH 7.0 - 7.5',
    FALSE,
    TRUE
),
(
    'Ikan Mas Koki Oranda Red Cap Grade A',
    'ikan-mas-koki-oranda-red-cap-grade-a',
    'Ikan Mas Koki',
    'Ikan Mas Koki varietas Oranda Red Cap dengan jambul merah merekah di atas kepala dan tubuh putih bersih. Bentuk tubuh membulat lucu (chubby) dengan sirip ekor ganda menjuntai indah.',
    95000,
    12,
    'https://images.unsplash.com/photo-1579161256825-57ba3094f057?auto=format&fit=crop&w=800&q=80',
    'Kelompok Budidaya Koki Pasanggar Jaya',
    '9 - 10 cm',
    '5 Bulan',
    'Campur (Unsexed)',
    'Mudah',
    'Pelet tenggelam koki, cacing darah',
    'Suhu 20-25°C • pH 7.2 - 7.8 (Aerator Stabil)',
    TRUE,
    TRUE
),
(
    'Ikan Mas Koki Ranchu Calico',
    'ikan-mas-koki-ranchu-calico',
    'Ikan Mas Koki',
    'Ikan Mas Koki Ranchu tanpa sirip punggung dengan kelengkungan punggung proporsional dan kepala bertekstur. Corak Calico 3 warna (hitam, jingga, perak). Peliharaan favorit penggemar goldfish.',
    135000,
    9,
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
    'Kelompok Budidaya Koki Pasanggar Jaya',
    '8 - 9 cm',
    '4.5 Bulan',
    'Campur (Unsexed)',
    'Mudah',
    'Pelet wheat germ koki & sayur rebus',
    'Suhu 21-25°C • pH 7.0 - 7.6',
    FALSE,
    TRUE
),
(
    'Ikan Molly Balon Marmer Marble 5 Ekor',
    'ikan-molly-balon-marmer-5-ekor',
    'Ikan Molly & Platy',
    'Paket 5 ekor Ikan Molly Balon dengan corak totol hitam putih marmer yang menggemaskan. Perut bulat khas, sangat jinak, dan membantu memakan alga lumut di kaca akuarium.',
    30000,
    35,
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/Mollies.jpg',
    'Sentra Aquascape Mini Pasanggar',
    '3.5 cm (Paket 5 Ekor)',
    '2.5 Bulan',
    'Campur (Jantan + Betina)',
    'Sangat Mudah (Tahan Banting)',
    'Pelet kecil, lumut, serpihan pakan',
    'Suhu 24-29°C • pH 7.0 - 8.2',
    FALSE,
    TRUE
),
(
    'Ikan Arwana Silver Red Tail 20cm',
    'ikan-arwana-silver-red-tail-20cm',
    'Ikan Predator & Eksotis',
    'Ikan Arwana Silver Red Tail berukuran 20 cm. Sisik mengkilap platinum dengan rona kemerahan di sirip ekor bawah. Dayung panjang, kumis sempurna tidak cacat, nafsu makan jangkrik dan ulat hongkong tinggi.',
    450000,
    5,
    'https://upload.wikimedia.org/wikipedia/commons/b/b4/Arowana.jpg',
    'Koleksi Spesial Pasanggar Predator Club',
    '20 - 22 cm',
    '6 Bulan',
    'Campur (Unsexed)',
    'Mahir (Akuarium Minimal 100 cm)',
    'Jangkrik, kelabang, udang segar, ulat jerman',
    'Suhu 27-30°C • pH 6.5 - 7.0 (Tutup Akuarium Rapat)',
    TRUE,
    TRUE
),
(
    'Ikan Channa Marulioides Yellow Sentarum',
    'ikan-channa-marulioides-yellow-sentarum',
    'Ikan Predator & Eksotis',
    'Ikan Channa Maru Yellow Sentarum size 15 cm. Bunga dan bar cabung sudah bermunculan rapi, mental bar-bar, aktif flaring di kaca akuarium. Sangat dicari para pecinta snakehead.',
    280000,
    7,
    'https://upload.wikimedia.org/wikipedia/commons/0/08/Snakehead_-_Channa_argus.jpg',
    'Koleksi Spesial Pasanggar Predator Club',
    '15 cm',
    '4 Bulan',
    'Campur (Unsexed)',
    'Menengah',
    'Udang basah, cacing tanah, jangkrik',
    'Suhu 26-29°C • pH 6.0 - 7.2 (Daun Ketapang Cokelat)',
    FALSE,
    TRUE
),
(
    'Ikan Louhan Kamfa F2 Mutiara Mewah',
    'ikan-louhan-kamfa-f2-mutiara-mewah',
    'Ikan Predator & Eksotis',
    'Ikan Louhan Kamfa F2 jenong air menonjol, mutiara silang rapi melingkari seluruh badan hingga sirip, ekor wrap lebar, warna dasar merah merona cerah.',
    380000,
    4,
    'https://upload.wikimedia.org/wikipedia/commons/6/68/Flowerhorn_cichlid.jpg',
    'Peternak Louhan Pasanggar',
    '12 cm',
    '4.5 Bulan',
    'Jantan (Male)',
    'Menengah',
    'Pelet louhan jenong & udang kering',
    'Suhu 28-31°C • pH 7.2 - 7.8',
    FALSE,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

