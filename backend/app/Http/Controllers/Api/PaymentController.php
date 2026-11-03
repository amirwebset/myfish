<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Order;
use App\Models\Payment;

class PaymentController extends Controller
{
    /**
     * Submit payment confirmation with proof of transfer.
     */
    public function submit(Request $request, $orderNumber)
    {
        $user = $request->user();

        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (in_array($order->status, ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai'])) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah dibayar atau sedang diproses.',
            ], 422);
        }

        if ($order->status === 'dibatalkan') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini telah dibatalkan.',
            ], 422);
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_name' => 'required|string|max:255',
            'account_number' => 'nullable|string|max:50',
            'amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:500',
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Upload proof image safely
        $path = $request->file('proof_image')->store('payment_proofs', 'public');

        // Delete old payment proof if re-submitting after rejection
        $payment = Payment::where('order_id', $order->id)->first();

        if ($payment) {
            if ($payment->proof_image && Storage::disk('public')->exists($payment->proof_image)) {
                Storage::disk('public')->delete($payment->proof_image);
            }

            $payment->update([
                'bank_name' => $validated['bank_name'],
                'account_name' => $validated['account_name'],
                'account_number' => $validated['account_number'] ?? null,
                'amount' => $validated['amount'],
                'proof_image' => $path,
                'notes' => $validated['notes'] ?? null,
                'status' => 'menunggu_verifikasi',
                'rejection_reason' => null,
            ]);
        } else {
            $payment = Payment::create([
                'order_id' => $order->id,
                'bank_name' => $validated['bank_name'],
                'account_name' => $validated['account_name'],
                'account_number' => $validated['account_number'] ?? null,
                'amount' => $validated['amount'],
                'proof_image' => $path,
                'notes' => $validated['notes'] ?? null,
                'status' => 'menunggu_verifikasi',
            ]);
        }

        // Update order status to waiting for verification
        $order->status = 'menunggu_verifikasi';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah! Administrator akan segera memverifikasi.',
            'payment' => [
                'id' => $payment->id,
                'bank_name' => $payment->bank_name,
                'account_name' => $payment->account_name,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'proof_url' => asset('storage/' . $path),
            ],
        ]);
    }
}
