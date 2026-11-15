// Helper utilities for WhatsApp integration in IKANKU
export const DEFAULT_WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';

/**
 * Clean phone number to international WhatsApp format (62...)
 */
export function formatPhoneNumber(phone) {
  if (!phone) return DEFAULT_WA_NUMBER;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generate direct WhatsApp URL with URL-encoded message
 */
export function getWhatsAppUrl(message, phone = DEFAULT_WA_NUMBER) {
  const targetPhone = formatPhoneNumber(phone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate product inquiry message for video request or stock check
 */
export function generateProductInquiryMessage(product) {
  const price = product.formatted_price || `Rp ${Number(product.price).toLocaleString('id-ID')}`;
  const breeder = product.breeder || 'Kelompok Peternak Desa Pasanggar, Kec. Pegantenan, Pamekasan';

  return `Halo Pengelola IKANKU Pasanggar 👋
Saya tertarik dengan ikan hias berikut di website:

🐠 *${product.name}*
💰 Harga: ${price} / ekor
🏡 Asal Kolam: ${breeder}
🔗 Link Produk: ${window.location.origin}/katalog/${product.slug || product.id}

Apakah stok ikan ini masih tersedia dan sehat lincah?
Boleh minta kiriman video flaring / gerak aktif ikannya via WhatsApp? Terima kasih!`;
}

/**
 * Generate cart order message for quick checkout via WhatsApp
 */
export function generateCartOrderMessage(items, subtotal, shipping = null, packing = null, recipient = null) {
  const itemsText = items.map((it, idx) => {
    const itemPrice = it.formatted_subtotal || `Rp ${Number(it.price * it.quantity).toLocaleString('id-ID')}`;
    return `${idx + 1}. *${it.name}* (${it.quantity} ekor) - ${itemPrice}`;
  }).join('\n');

  let text = `Halo Pengelola IKANKU Pasanggar 👋
Saya ingin melakukan pemesanan ikan hias dari website:

📋 *Daftar Ikan Dipesan:*
${itemsText}

💰 *Subtotal Ikan:* Rp ${Number(subtotal).toLocaleString('id-ID')}`;

  if (shipping) {
    text += `\n🚚 *Kurir Ekspedisi:* ${shipping.name} (Rp ${Number(shipping.cost).toLocaleString('id-ID')})`;
  }

  if (packing) {
    text += `\n📦 *Kemasan Khusus:* ${packing.name} ${packing.cost > 0 ? `(Rp ${Number(packing.cost).toLocaleString('id-ID')})` : '(Gratis Promo)'}`;
  }

  const grandTotal = subtotal + (shipping?.cost || 0) + (packing?.cost || 0);
  text += `\n💳 *Perkiraan Total:* Rp ${Number(grandTotal).toLocaleString('id-ID')}`;

  if (recipient && (recipient.recipient_name || recipient.name)) {
    text += `\n\n📍 *Data Penerima:*
Nama: ${recipient.recipient_name || recipient.name}
Telepon: ${recipient.phone || '-'}
Alamat: ${recipient.address || '-'}`;
    if (recipient.notes) {
      text += `\nCatatan Tambahan: ${recipient.notes}`;
    }
  }

  text += `\n\nMohon dicek ketersediaan stok di kolam peternak Desa Pasanggar dan nomor rekening resmi untuk pembayaran. Terima kasih!`;

  return text;
}
