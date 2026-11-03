<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * List current customer's orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with(['items.product', 'payment'])
            ->latest()
            ->get();

        $formatted = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => (float) $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'status_badge' => $order->status_badge_class,
                'recipient_name' => $order->recipient_name,
                'items_count' => $order->items->sum('quantity'),
                'created_at' => $order->created_at->format('d M Y H:i'),
                'payment' => $order->payment ? [
                    'status' => $order->payment->status,
                    'bank_name' => $order->payment->bank_name,
                    'proof_image' => $order->payment->proof_url ?? asset('storage/' . $order->payment->proof_image),
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'orders' => $formatted,
        ]);
    }

    /**
     * Get single order detail by order_number.
     */
    public function show(Request $request, $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->with(['items.product', 'payment'])
            ->firstOrFail();

        $items = $order->items->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_price' => (float) $item->product_price,
                'formatted_price' => 'Rp ' . number_format($item->product_price, 0, ',', '.'),
                'quantity' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
                'formatted_subtotal' => 'Rp ' . number_format($item->subtotal, 0, ',', '.'),
                'image_url' => $item->product ? $item->product->image_url : null,
            ];
        });

        return response()->json([
            'success' => true,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'recipient_name' => $order->recipient_name,
                'phone' => $order->phone,
                'address' => $order->address,
                'notes' => $order->notes,
                'total_amount' => (float) $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'payment_method' => $order->payment_method,
                'tracking_number' => $order->tracking_number,
                'created_at' => $order->created_at->format('d M Y H:i'),
                'items' => $items,
                'payment' => $order->payment ? [
                    'id' => $order->payment->id,
                    'bank_name' => $order->payment->bank_name,
                    'account_name' => $order->payment->account_name,
                    'account_number' => $order->payment->account_number,
                    'amount' => (float) $order->payment->amount,
                    'formatted_amount' => 'Rp ' . number_format($order->payment->amount, 0, ',', '.'),
                    'proof_image' => asset('storage/' . $order->payment->proof_image),
                    'status' => $order->payment->status,
                    'rejection_reason' => $order->payment->rejection_reason,
                    'created_at' => $order->payment->created_at->format('d M Y H:i'),
                ] : null,
            ],
        ]);
    }

    /**
     * Cancel unpaid order and restore stock.
     */
    public function cancel(Request $request, $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($order->status !== 'menunggu_pembayaran') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dapat dibatalkan pada tahap ini.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->status = 'dibatalkan';
            $order->save();

            // Restore stock
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibatalkan dan stok telah dikembalikan.',
        ]);
    }
}
