<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * Display a listing of customer orders for administrator.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'payment']);

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sq) use ($q) {
                $sq->where('order_number', 'like', "%{$q}%")
                   ->orWhere('recipient_name', 'like', "%{$q}%")
                   ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $orders = $query->latest()->paginate(12)->withQueryString();

        return view('admin.orders.index', compact('orders'));
    }

    /**
     * Display order details.
     */
    public function show(Order $order)
    {
        $order->load(['user', 'items.product', 'payment.verifier']);
        return view('admin.orders.show', compact('order'));
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:menunggu_pembayaran,menunggu_verifikasi,pembayaran_diterima,diproses,dikirim,selesai,dibatalkan',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($order, $oldStatus, $newStatus, $validated) {
            // Jika pesanan dibatalkan padahal sebelumnya aktif, kembalikan stok produk
            if ($newStatus === 'dibatalkan' && $oldStatus !== 'dibatalkan') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            }

            // Jika sebelumnya dibatalkan lalu diaktifkan kembali, kurangi stok jika tersedia
            if ($oldStatus === 'dibatalkan' && $newStatus !== 'dibatalkan') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
                    }
                }
            }

            $order->status = $newStatus;
            if (!empty($validated['tracking_number'])) {
                $order->tracking_number = $validated['tracking_number'];
            }
            $order->save();
        });

        return back()->with('success', 'Status pesanan ' . $order->order_number . ' berhasil diperbarui menjadi: ' . $order->status_label);
    }

    /**
     * Verify or reject payment proof.
     */
    public function verifyPayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'action' => 'required|in:accept,reject',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $payment = $order->payment;
        if (!$payment) {
            return back()->with('error', 'Pesanan ini belum memiliki data bukti pembayaran.');
        }

        if ($validated['action'] === 'accept') {
            $payment->update([
                'status' => 'diterima',
                'verified_at' => now(),
                'verified_by' => auth()->id(),
                'rejection_reason' => null,
            ]);

            $order->update(['status' => 'pembayaran_diterima']);

            return back()->with('success', 'Pembayaran pesanan ' . $order->order_number . ' berhasil diverifikasi. Status pesanan diperbarui menjadi "Pembayaran Diterima".');
        } else {
            $payment->update([
                'status' => 'ditolak',
                'rejection_reason' => $validated['rejection_reason'] ?? 'Bukti pembayaran tidak valid atau nominal tidak sesuai.',
                'verified_at' => now(),
                'verified_by' => auth()->id(),
            ]);

            // Kembalikan status pesanan ke menunggu pembayaran agar pembeli dapat mengunggah ulang
            $order->update(['status' => 'menunggu_pembayaran']);

            return back()->with('warning', 'Bukti pembayaran pesanan ditolak dengan alasan: ' . ($validated['rejection_reason'] ?? 'Tidak valid'));
        }
    }
}
