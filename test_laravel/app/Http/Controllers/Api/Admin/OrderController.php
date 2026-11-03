<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * List all customer orders for admin.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'payment', 'items.product'])->latest();

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(20);

        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'recipient_name' => $order->recipient_name,
                'phone' => $order->phone,
                'address' => $order->address,
                'total_amount' => (float) $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'status_badge' => $order->status_badge_class,
                'payment_method' => $order->payment_method,
                'tracking_number' => $order->tracking_number,
                'items_count' => $order->items->sum('quantity'),
                'created_at' => $order->created_at->format('d M Y H:i'),
                'payment' => $order->payment ? [
                    'id' => $order->payment->id,
                    'status' => $order->payment->status,
                    'bank_name' => $order->payment->bank_name,
                    'amount' => (float) $order->payment->amount,
                    'proof_image' => asset('storage/' . $order->payment->proof_image),
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Show single order details.
     */
    public function show($id)
    {
        $order = Order::with(['user', 'payment', 'items.product'])->findOrFail($id);

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
                'status_badge' => $order->status_badge_class,
                'payment_method' => $order->payment_method,
                'tracking_number' => $order->tracking_number,
                'created_at' => $order->created_at->format('d M Y H:i'),
                'customer' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                ] : null,
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
     * Update order status and tracking number.
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::with('items')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:menunggu_pembayaran,menunggu_verifikasi,pembayaran_diterima,diproses,dikirim,selesai,dibatalkan',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $previousStatus = $order->status;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($order, $previousStatus, $newStatus, $validated) {
            // If cancelling an order that was not previously cancelled, restore stock
            if ($newStatus === 'dibatalkan' && $previousStatus !== 'dibatalkan') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            }

            // If reverting from cancelled to active, deduct stock again
            if ($previousStatus === 'dibatalkan' && $newStatus !== 'dibatalkan') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
                    }
                }
            }

            $order->status = $newStatus;
            if (isset($validated['tracking_number'])) {
                $order->tracking_number = $validated['tracking_number'];
            }
            $order->save();
        });

        return response()->json([
            'success' => true,
            'message' => "Status pesanan {$order->order_number} berhasil diperbarui menjadi {$order->status_label}.",
            'status' => $order->status,
            'status_label' => $order->status_label,
            'tracking_number' => $order->tracking_number,
        ]);
    }
}
