<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderService;

class CheckoutController extends Controller
{
    /**
     * Process checkout with database transaction, atomic stock deduction,
     * live shipping fee calculation, and unique transfer code.
     */
    public function process(Request $request)
    {
        $user = $request->user();

        // 0. Auto-cancel pesanan kedaluwarsa sebelum checkout untuk merilis kuota stok ikan
        OrderService::cancelExpiredOrders();

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'required|string|in:bank_transfer,cod',
            'shipping_courier' => 'nullable|string|max:100',
            'shipping_cost' => 'nullable|numeric|min:0',
            'packing_type' => 'nullable|string|max:100',
            'packing_cost' => 'nullable|numeric|min:0',
            'unique_code' => 'nullable|integer|min:0|max:999',
        ]);

        // Get user's active cart items
        $cartItems = Cart::where('user_id', $user->id)
            ->with('product')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang belanja Anda kosong.',
            ], 422);
        }

        try {
            $shippingCost = (float) ($validated['shipping_cost'] ?? 25000);
            $packingCost = (float) ($validated['packing_cost'] ?? 0);
            $uniqueCode = isset($validated['unique_code']) ? (int) $validated['unique_code'] : rand(100, 899);
            $courier = $validated['shipping_courier'] ?? 'JNE YES (Pengiriman Cepat Ikan Hidup)';
            $packingType = $validated['packing_type'] ?? 'Standar Tabung Oksigen & Plastik Dobel';

            $fishSubtotal = 0;

            $order = DB::transaction(function () use (
                $user, $validated, $cartItems, $shippingCost, $packingCost, $uniqueCode, $courier, $packingType, &$fishSubtotal
            ) {
                // 1. Validate stocks with lockForUpdate to prevent race conditions
                foreach ($cartItems as $item) {
                    $product = Product::where('id', $item->product_id)->lockForUpdate()->first();

                    if (!$product || !$product->is_active) {
                        throw new \Exception("Produk '{$item->product->name}' sudah tidak aktif atau tidak ditemukan.");
                    }

                    if ($product->stock < $item->quantity) {
                        throw new \Exception("Stok produk '{$product->name}' tidak mencukupi (Tersedia: {$product->stock}, Diminta: {$item->quantity}).");
                    }

                    $fishSubtotal += ($product->price * $item->quantity);
                }

                // Total: Subtotal Ikan + Ongkir + Biaya Packing + Kode Unik Verifikasi Transfer
                $totalAmount = $fishSubtotal + $shippingCost + $packingCost + $uniqueCode;

                // 2. Generate unique order number (e.g. ORD-20261104-XXXXX)
                $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

                // 3. Format structured logistics tag into order notes
                $logisticsTag = "[Logistik: {$courier} | Ongkir: {$shippingCost} | Packing: {$packingType} | BiayaPacking: {$packingCost} | KodeUnik: {$uniqueCode}]";
                $userNotes = trim($validated['notes'] ?? '');
                $orderNotes = $userNotes ? ($userNotes . "\n" . $logisticsTag) : $logisticsTag;

                // 4. Create order record
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'recipient_name' => $validated['recipient_name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'notes' => $orderNotes,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'menunggu_pembayaran',
                ]);

                // 5. Create frozen order items and deduct product stock
                foreach ($cartItems as $item) {
                    $product = Product::where('id', $item->product_id)->first();

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $product->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $product->price * $item->quantity,
                    ]);

                    // Deduct stock atomically
                    $product->decrement('stock', $item->quantity);
                }

                // 6. Clear user cart
                Cart::where('user_id', $user->id)->delete();

                return $order;
            });

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat! Silakan lakukan pembayaran sesuai nominal transfer.',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => (float) $order->total_amount,
                    'formatted_total' => $order->formatted_total,
                    'status' => $order->status,
                    'status_label' => $order->status_label,
                    'recipient_name' => $order->recipient_name,
                    'phone' => $order->phone,
                    'address' => $order->address,
                    'notes' => $order->notes,
                    'payment_method' => $order->payment_method,
                    'fish_subtotal' => $fishSubtotal,
                    'formatted_fish_subtotal' => 'Rp ' . number_format($fishSubtotal, 0, ',', '.'),
                    'shipping_cost' => $shippingCost,
                    'formatted_shipping_cost' => 'Rp ' . number_format($shippingCost, 0, ',', '.'),
                    'shipping_courier' => $courier,
                    'packing_cost' => $packingCost,
                    'formatted_packing_cost' => 'Rp ' . number_format($packingCost, 0, ',', '.'),
                    'packing_type' => $packingType,
                    'unique_code' => $uniqueCode,
                    'created_at' => $order->created_at->format('d M Y H:i'),
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
