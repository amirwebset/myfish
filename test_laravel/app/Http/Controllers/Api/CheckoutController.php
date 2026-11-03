<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class CheckoutController extends Controller
{
    /**
     * Process checkout with database transaction and atomic stock deduction.
     */
    public function process(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'required|string|in:bank_transfer,cod',
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
            $order = DB::transaction(function () use ($user, $validated, $cartItems) {
                $totalAmount = 0;

                // 1. Validate stocks with lockForUpdate to prevent race conditions
                foreach ($cartItems as $item) {
                    $product = Product::where('id', $item->product_id)->lockForUpdate()->first();

                    if (!$product || !$product->is_active) {
                        throw new \Exception("Produk '{$item->product->name}' sudah tidak aktif atau tidak ditemukan.");
                    }

                    if ($product->stock < $item->quantity) {
                        throw new \Exception("Stok produk '{$product->name}' tidak mencukupi (Tersedia: {$product->stock}, Diminta: {$item->quantity}).");
                    }

                    $totalAmount += ($product->price * $item->quantity);
                }

                // 2. Generate unique order number (e.g. ORD-20261024-XXXXX)
                $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

                // 3. Create order record
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'recipient_name' => $validated['recipient_name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'notes' => $validated['notes'] ?? null,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'menunggu_pembayaran',
                ]);

                // 4. Create frozen order items and deduct product stock
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

                    // Deduct stock
                    $product->decrement('stock', $item->quantity);
                }

                // 5. Clear cart
                Cart::where('user_id', $user->id)->delete();

                return $order;
            });

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat! Silakan lakukan pembayaran.',
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
                    'payment_method' => $order->payment_method,
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
