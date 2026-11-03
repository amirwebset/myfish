<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Order;
use App\Models\Payment;

class OrderController extends Controller
{
    /**
     * Display list of customer orders.
     */
    public function index()
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['items.product', 'payment'])
            ->latest()
            ->paginate(10);

        return view('frontend.orders.index', compact('orders'));
    }

    /**
     * Show detailed order information.
     */
    public function show($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', auth()->id())
            ->with(['items.product', 'payment'])
            ->firstOrFail();

        return view('frontend.orders.show', compact('order'));
    }

    /**
     * Handle payment proof upload.
     */
    public function uploadPayment(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if (!in_array($order->status, ['menunggu_pembayaran', 'menunggu_verifikasi'])) {
            return back()->with('error', 'Status pesanan saat ini tidak memungkinkan pengunggahan bukti pembayaran.');
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_name' => 'required|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'proof_image' => 'required|image|mimes:jpeg,png,jpg|max:3072',
            'notes' => 'nullable|string|max:500',
        ]);

        // Upload bukti pembayaran ke storage publik
        $imagePath = $request->file('proof_image')->store('payments', 'public');

        // Simpan / update record pembayaran
        if ($order->payment) {
            // Hapus bukti lama jika ada dan tersimpan lokal
            if (!str_starts_with($order->payment->proof_image, 'http') && Storage::disk('public')->exists($order->payment->proof_image)) {
                Storage::disk('public')->delete($order->payment->proof_image);
            }

            $order->payment->update([
                'bank_name' => $validated['bank_name'],
                'account_name' => $validated['account_name'],
                'account_number' => $validated['account_number'],
                'amount' => $order->total_amount,
                'proof_image' => $imagePath,
                'notes' => $validated['notes'],
                'status' => 'menunggu_verifikasi',
                'rejection_reason' => null,
            ]);
        } else {
            Payment::create([
                'order_id' => $order->id,
                'bank_name' => $validated['bank_name'],
                'account_name' => $validated['account_name'],
                'account_number' => $validated['account_number'],
                'amount' => $order->total_amount,
                'proof_image' => $imagePath,
                'notes' => $validated['notes'],
                'status' => 'menunggu_verifikasi',
            ]);
        }

        // Perbarui status pesanan menjadi menunggu verifikasi oleh administrator
        $order->update(['status' => 'menunggu_verifikasi']);

        return back()->with('success', 'Bukti transfer berhasil diunggah! Administrator akan segera memverifikasi pembayaran Anda.');
    }
}
