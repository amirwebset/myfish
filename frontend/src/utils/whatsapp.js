// Helper utilities for WhatsApp integration in IKANKU
export const DEFAULT_WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281249412813';

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
 * Generate cart order message for checkout via WhatsApp (Standar UTS IKANKU)
 */
export function generateCartOrderMessage(items, subtotal, shipping = null, packing = null, recipient = null) {
  const itemsText = items.map((it, idx) => {
    const itemPrice = it.formatted_subtotal || `Rp ${Number(it.price * it.quantity).toLocaleString('id-ID')}`;
    return `${idx + 1}. ${it.name} (${it.quantity} ekor) - ${itemPrice}`;
  }).join('\n');

  const grandTotal = subtotal + (shipping?.cost || 0) + (packing?.cost || 0);

  let text = `Halo Admin Desa Pasanggar, saya ingin memesan:
${itemsText}

Total: Rp ${Number(grandTotal).toLocaleString('id-ID')}`;

  if (recipient && (recipient.recipient_name || recipient.name)) {
    text += `\nAlamat: ${recipient.address || '-'}`;
    if (recipient.phone) {
      text += `\nNo. HP: ${recipient.phone}`;
    }
  }

  if (shipping) {
    text += `\nMetode Pengiriman: ${shipping.name}`;
  }

  if (packing && packing.name) {
    text += `\nKemasan: ${packing.name}`;
  }

  if (recipient?.notes) {
    text += `\nCatatan: ${recipient.notes}`;
  }

  text += `\n\nMohon konfirmasi ketersediaan stok ikan dan nomor rekening untuk transfer. Terima kasih!`;

  return text;
}

