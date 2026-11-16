import { createClient } from '@supabase/supabase-js';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockProducts';

// Baca konfigurasi dari environment variable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Deteksi apakah Supabase sudah dikonfigurasi dengan URL & Key yang valid
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Inisialisasi client Supabase
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ==============================================================================
// 1. SERVICE: KATALOG PRODUK IKAN HIAS
// ==============================================================================

/**
 * Mengambil daftar produk ikan hias dengan dukungan pencarian, kategori, harga, dan sortir.
 */
export async function fetchProductsFromDb({
  search = '',
  category = '',
  sort = 'latest',
  tag = '',
  minPrice = null,
  maxPrice = null,
  page = 1,
  perPage = 24,
} = {}) {
  // Jika Supabase belum dikonfigurasi, gunakan data fallback cerdas Desa Pasanggar
  if (!isSupabaseConfigured() || !supabase) {
    return filterMockProducts({ search, category, sort, tag, minPrice, maxPrice, page, perPage });
  }

  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Filter Pencarian Nama atau Deskripsi
    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    // Filter Kategori
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    // Filter Tag Khusus
    if (tag === 'ready_stock') {
      query = query.gt('stock', 0);
    } else if (tag === 'featured') {
      query = query.eq('is_featured', true);
    } else if (tag === 'pemula') {
      query = query.ilike('care_level', '%Mudah%');
    }

    // Filter Rentang Harga
    if (minPrice !== null && !isNaN(minPrice)) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      query = query.lte('price', maxPrice);
    }

    // Sortir
    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'name_asc') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    if (Array.isArray(data)) {
      if (data.length > 0) {
        const formatted = data.map(formatProduct);
        return {
          products: formatted,
          meta: {
            total: count || formatted.length,
            current_page: page,
            last_page: Math.ceil((count || formatted.length) / perPage) || 1,
            per_page: perPage,
          },
          source: 'supabase',
        };
      }

      // Jika ada filter pencarian/kategori dan hasilnya 0 ikan
      const hasFilter = Boolean(search.trim() || category || tag || minPrice !== null || maxPrice !== null);
      if (hasFilter) {
        return {
          products: [],
          meta: {
            total: 0,
            current_page: page,
            last_page: 1,
            per_page: perPage,
          },
          source: 'supabase',
        };
      }
    }

    // Jika tabel benar-benar kosong di cloud (belum diseed), gunakan katalog mock Pasanggar
    return filterMockProducts({ search, category, sort, tag, minPrice, maxPrice, page, perPage });
  } catch (err) {
    console.warn('Gagal memuat produk dari Supabase, beralih ke katalog lokal:', err.message);
    return filterMockProducts({ search, category, sort, tag, minPrice, maxPrice, page, perPage });
  }
}

/**
 * Mengambil detail produk ikan hias berdasarkan ID atau Slug
 */
export async function fetchProductByIdentifier(identifier) {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_PRODUCTS.find(p => String(p.id) === String(identifier) || p.slug === identifier) || null;
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let query = supabase.from('products').select('*');
    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();
    if (error || !data) {
      return MOCK_PRODUCTS.find(p => String(p.id) === String(identifier) || p.slug === identifier) || null;
    }

    return formatProduct(data);
  } catch (err) {
    console.warn('Gagal memuat detail dari Supabase:', err.message);
    return MOCK_PRODUCTS.find(p => String(p.id) === String(identifier) || p.slug === identifier) || null;
  }
}

/**
 * Mengambil kategori ikan hias
 */
export async function fetchCategoriesFromDb() {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIES;
    }

    // Hitung jumlah ikan per kategori
    const counts = {};
    data.forEach(item => {
      const cat = item.category || 'Lainnya';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map((catName, idx) => ({
      id: idx + 1,
      name: catName,
      slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      products_count: counts[catName],
    }));
  } catch (err) {
    return MOCK_CATEGORIES;
  }
}

// ==============================================================================
// 2. SERVICE: TRANSAKSI & CHECKOUT PESANAN (E-COMMERCE)
// ==============================================================================

/**
 * Menyimpan pesanan baru ke tabel orders dan order_items dengan validasi stok
 */
export async function createOrderInDb({
  customer_name,
  whatsapp,
  address,
  district,
  city = 'Pamekasan',
  postal_code = '',
  notes = '',
  shipping_cost = 0,
  total_price,
  items = [],
  user_id = null,
}) {
  // Generate kode pesanan unik (contoh: IKN-20261115-9481)
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const order_code = `IKN-${dateStr}-${randomSuffix}`;

  if (!isSupabaseConfigured() || !supabase) {
    // Mode Lokal / Simulasi: Simpan ke localStorage agar tidak hilang saat demo
    const localOrder = {
      id: 'local_' + Date.now(),
      order_code,
      customer_name,
      whatsapp,
      address,
      district,
      city,
      postal_code,
      notes,
      shipping_cost,
      total_price,
      order_status: 'menunggu_konfirmasi',
      payment_status: 'menunggu_pembayaran',
      created_at: new Date().toISOString(),
      items,
    };

    const savedOrders = JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
    savedOrders.unshift(localOrder);
    localStorage.setItem('ikanku_orders', JSON.stringify(savedOrders));

    return {
      success: true,
      order: localOrder,
      order_code,
      is_local: true,
      message: 'Pesanan tersimpan secara lokal (konfigurasi Supabase untuk sinkronisasi cloud)',
    };
  }

  try {
    // 1. Simpan Header Pesanan (orders)
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code,
        user_id,
        customer_name,
        whatsapp,
        address,
        district,
        city,
        postal_code,
        notes,
        shipping_cost,
        total_price,
        order_status: 'menunggu_konfirmasi',
        payment_status: 'menunggu_pembayaran',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Simpan Detail Item (order_items)
    if (items.length > 0) {
      const orderItemsToInsert = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id || (typeof item.id === 'string' && item.id.includes('-') ? item.id : null),
        product_name: item.name || item.product?.name || 'Ikan Hias Pasanggar',
        quantity: item.quantity || 1,
        price: item.price || 0,
        subtotal: (item.price || 0) * (item.quantity || 1),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error('Error insert order items:', itemsError);
      }

      // 3. Kurangi stok produk di database
      for (const item of items) {
        if (item.product_id || item.id) {
          const prodId = item.product_id || item.id;
          try {
            await supabase.rpc('reduce_product_stock', {
              p_product_id: prodId,
              p_quantity: item.quantity || 1,
            });
          } catch (stockErr) {
            console.warn(`Gagal memotong stok via RPC untuk produk ${prodId}:`, stockErr.message);
          }
        }
      }
    }

    return {
      success: true,
      order: orderData,
      order_code,
      is_local: false,
    };
  } catch (err) {
    console.error('Gagal membuat pesanan di Supabase:', err);
    throw err;
  }
}

/**
 * Mengambil data pesanan berdasarkan kode pesanan unik (contoh: IKN-20261115-XXXX)
 */
export async function fetchOrderByCode(orderCode) {
  if (!isSupabaseConfigured() || !supabase) {
    const savedOrders = JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
    return savedOrders.find(o => o.order_code === orderCode) || null;
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_code', orderCode)
      .single();

    if (orderError || !order) {
      const savedOrders = JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
      return savedOrders.find(o => o.order_code === orderCode) || null;
    }

    return order;
  } catch (err) {
    console.warn('Gagal mengambil pesanan dari Supabase:', err.message);
    const savedOrders = JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
    return savedOrders.find(o => o.order_code === orderCode) || null;
  }
}

// ==============================================================================
// 3. SERVICE: DASHBOARD ADMIN IKANKU (PENGELOLA DESA PASANGGAR)
// ==============================================================================

/**
 * Mengambil semua produk ikan untuk halaman Admin (baik aktif maupun nonaktif)
 */
export async function adminFetchProducts({ search = '', category = '' } = {}) {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });
      if (search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }
      if (category) {
        query = query.ilike('category', `%${category}%`);
      }
      query = query.order('created_at', { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      if (Array.isArray(data)) {
        const formatted = data.map(formatProduct);
        return {
          products: formatted,
          total: count ?? formatted.length,
          source: 'supabase',
        };
      }
    } catch (err) {
      console.warn('Gagal memuat produk admin dari Supabase:', err.message);
    }
  }

  // Fallback Local Storage / Mock
  let stored = localStorage.getItem('ikanku_admin_products');
  let list = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];

  if (search.trim()) {
    const s = search.toLowerCase().trim();
    list = list.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
  }
  if (category) {
    list = list.filter(p =>
      String(p.category_id) === String(category) ||
      p.category?.slug === category ||
      p.category?.name?.toLowerCase().includes(category.toLowerCase()) ||
      String(p.category).toLowerCase().includes(category.toLowerCase())
    );
  }

  return {
    products: list.map(formatProduct),
    total: list.length,
    source: isSupabaseConfigured() ? 'supabase_fallback' : 'local',
  };
}

/**
 * Menyimpan atau memperbarui produk ikan di Supabase Cloud Database
 */
export async function adminSaveProduct(formData, isEditing = false, editId = null) {
  const priceNum = parseFloat(formData.price) || 0;
  const stockNum = parseInt(formData.stock, 10) || 0;
  const categoryName = typeof formData.category === 'object' ? (formData.category?.name || 'Ikan Hias') : (formData.category || 'Ikan Hias');
  const imgUrl = formData.image_url || 'https://images.unsplash.com/photo-1544943910-4c1dc44a046c?auto=format&fit=crop&w=800&q=80';

  if (isSupabaseConfigured() && supabase) {
    const payload = {
      name: formData.name,
      category: categoryName,
      price: priceNum,
      stock: stockNum,
      description: formData.description || '',
      image_url: imgUrl,
      is_featured: Boolean(formData.is_featured),
      is_active: Boolean(formData.is_active),
      updated_at: new Date().toISOString(),
    };

    if (isEditing && editId) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editId)
        .select()
        .single();

      if (error) throw new Error(`Supabase Error (${error.code}): ${error.message}`);
      syncLocalAdminProducts(data, true, editId);
      return { success: true, product: formatProduct(data), source: 'supabase' };
    } else {
      payload.slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      payload.breeder = 'Kelompok Peternak Desa Pasanggar';
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(`Supabase Error (${error.code}): ${error.message}`);
      syncLocalAdminProducts(data, false, data.id);
      return { success: true, product: formatProduct(data), source: 'supabase' };
    }
  }

  // Fallback Local Storage jika Supabase belum terpasang
  let stored = localStorage.getItem('ikanku_admin_products');
  let list = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];

  if (isEditing && editId) {
    list = list.map(p => {
      if (String(p.id) === String(editId)) {
        return {
          ...p,
          name: formData.name,
          category: { id: formData.category_id || 1, name: categoryName },
          price: priceNum,
          formatted_price: 'Rp ' + priceNum.toLocaleString('id-ID'),
          stock: stockNum,
          description: formData.description || '',
          image_url: imgUrl,
          is_featured: Boolean(formData.is_featured),
          is_active: Boolean(formData.is_active),
        };
      }
      return p;
    });
    localStorage.setItem('ikanku_admin_products', JSON.stringify(list));
    return { success: true, source: 'local' };
  } else {
    const newProduct = {
      id: 'local_fish_' + Date.now(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
      category: { id: formData.category_id || 1, name: categoryName },
      price: priceNum,
      formatted_price: 'Rp ' + priceNum.toLocaleString('id-ID'),
      stock: stockNum,
      description: formData.description || '',
      image_url: imgUrl,
      breeder: 'Kelompok Peternak Desa Pasanggar',
      is_featured: Boolean(formData.is_featured),
      is_active: Boolean(formData.is_active),
    };
    list.unshift(newProduct);
    localStorage.setItem('ikanku_admin_products', JSON.stringify(list));
    return { success: true, product: newProduct, source: 'local' };
  }
}

/**
 * Menghapus produk ikan dari database Supabase
 */
export async function adminDeleteProduct(productId) {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(`Supabase Error (${error.code}): ${error.message}`);
  }

  // Bersihkan juga dari cache local storage
  let stored = localStorage.getItem('ikanku_admin_products');
  if (stored) {
    let list = JSON.parse(stored).filter(p => String(p.id) !== String(productId));
    localStorage.setItem('ikanku_admin_products', JSON.stringify(list));
  }

  return { success: true };
}

/**
 * Memasukkan 12 data ikan hias awal Desa Pasanggar ke Supabase (Initial Seeding)
 */
export async function adminSeedInitialProducts() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Harap isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env terlebih dahulu.');
  }

  const rows = MOCK_PRODUCTS.map(p => ({
    name: p.name,
    slug: (p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + Math.floor(100 + Math.random() * 900),
    category: p.category?.name || p.category || 'Ikan Hias',
    description: p.description || '',
    price: p.price || 0,
    stock: p.stock || 0,
    image_url: p.image_url || '',
    breeder: p.breeder || 'Kelompok Peternak Desa Pasanggar',
    size: p.size || '',
    age: p.age || '',
    gender: p.gender || '',
    care_level: p.care_level || 'Mudah (Pemula)',
    feed: p.feed || '',
    water_param: p.water_param || '',
    is_featured: Boolean(p.is_featured),
    is_active: p.is_active !== false,
  }));

  const { data, error } = await supabase.from('products').insert(rows).select();
  if (error) throw new Error(`Gagal memasukkan data ke Supabase: ${error.message}`);

  return { success: true, count: data.length };
}

function syncLocalAdminProducts(savedItem, isEditing, editId) {
  try {
    let stored = localStorage.getItem('ikanku_admin_products');
    let list = stored ? JSON.parse(stored) : [...MOCK_PRODUCTS];
    if (isEditing) {
      list = list.map(p => String(p.id) === String(editId) ? { ...p, ...savedItem } : p);
    } else {
      list.unshift(savedItem);
    }
    localStorage.setItem('ikanku_admin_products', JSON.stringify(list));
  } catch (e) {}
}

export async function adminFetchOrders() {
  if (!isSupabaseConfigured() || !supabase) {
    return JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Admin fetch orders fallback:', err.message);
    return JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
  }
}

export async function adminUpdateOrderStatus(orderId, newStatus) {
  if (!isSupabaseConfigured() || !supabase) {
    const orders = JSON.parse(localStorage.getItem('ikanku_orders') || '[]');
    const updated = orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o);
    localStorage.setItem('ikanku_orders', JSON.stringify(updated));
    return { success: true };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Gagal memperbarui status pesanan:', err);
    throw err;
  }
}

// ==============================================================================
// 4. HELPER & FORMATTER
// ==============================================================================

function formatProduct(p) {
  return {
    ...p,
    formatted_price: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(p.price),
    // Pastikan struktur category kompatibel
    category: typeof p.category === 'object' && p.category !== null 
      ? p.category 
      : { id: p.category, name: p.category, slug: String(p.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') },
  };
}

function filterMockProducts({ search, category, sort, tag, minPrice, maxPrice, page, perPage }) {
  let list = [...MOCK_PRODUCTS];

  if (search?.trim()) {
    const s = search.toLowerCase().trim();
    list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  if (category) {
    list = list.filter(p => p.category?.slug === category || p.category?.name === category || p.category === category);
  }

  if (tag === 'ready_stock') {
    list = list.filter(p => p.stock > 0);
  } else if (tag === 'pemula') {
    list = list.filter(p => p.care_level?.includes('Mudah') || p.tags?.includes('pemula'));
  } else if (tag === 'featured') {
    list = list.filter(p => p.is_featured);
  }

  if (minPrice !== null && !isNaN(minPrice)) {
    list = list.filter(p => p.price >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    list = list.filter(p => p.price <= maxPrice);
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => b.id - a.id);
  }

  const from = (page - 1) * perPage;
  const paginated = list.slice(from, from + perPage);

  return {
    products: paginated,
    meta: {
      total: list.length,
      current_page: page,
      last_page: Math.ceil(list.length / perPage) || 1,
      per_page: perPage,
    },
    source: 'mock',
  };
}

