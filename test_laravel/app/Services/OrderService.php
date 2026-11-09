<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Product;

class OrderService
{
    /**
     * Otomatis membatalkan pesanan yang belum dibayar lewat dari 24 jam dan mengembalikan kuota stok ikan.
     */
    public static function cancelExpiredOrders(): int
    {
        $expiredOrders = Order::where('status', 'menunggu_pembayaran')
            ->where('created_at', '<', now()->subHours(24))
            ->with('items')
            ->get();

        $cancelledCount = 0;
        foreach ($expiredOrders as $order) {
            DB::transaction(function () use ($order) {
                $order->status = 'dibatalkan';
                $autoNote = '[Sistem: Dibatalkan otomatis karena melewati batas waktu pembayaran 24 jam. Stok telah dikembalikan.]';
                $order->notes = $order->notes ? ($order->notes . ' | ' . $autoNote) : $autoNote;
                $order->save();

                // Rollback stok ikan
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            });
            $cancelledCount++;
        }

        return $cancelledCount;
    }

    /**
     * Ekstrak rincian logistik dari catatan pesanan.
     */
    public static function parseLogistics(string $notes = null): array
    {
        $default = [
            'courier' => 'JNE YES (Pengiriman Cepat Ikan Hidup)',
            'shipping_cost' => 25000,
            'packing_type' => 'Standar Tabung Oksigen & Plastik Dobel',
            'packing_cost' => 0,
            'unique_code' => 0,
        ];

        if (empty($notes)) {
            return $default;
        }

        // Contoh: [Logistik: JNE YES | Ongkir: 25000 | Packing: Box Tebal | BiayaPacking: 15000 | KodeUnik: 284]
        if (preg_match('/\[Logistik:\s*([^|]+)\s*\|\s*Ongkir:\s*(\d+)\s*\|\s*Packing:\s*([^|]+)\s*\|\s*BiayaPacking:\s*(\d+)\s*\|\s*KodeUnik:\s*(\d+)\]/', $notes, $matches)) {
            return [
                'courier' => trim($matches[1]),
                'shipping_cost' => (float) $matches[2],
                'packing_type' => trim($matches[3]),
                'packing_cost' => (float) $matches[4],
                'unique_code' => (int) $matches[5],
            ];
        }

        return $default;
    }
}

