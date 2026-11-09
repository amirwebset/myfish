<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Payment;
use App\Models\Order;

class PaymentController extends Controller
{
    /**
     * List payments with optional status filter.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['order.user'])->latest();

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $payments = $query->paginate(20);

        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'order_number' => $payment->order ? $payment->order->order_number : '-',
                'customer_name' => $payment->order ? $payment->order->recipient_name : '-',
                'bank_name' => $payment->bank_name,
                'account_name' => $payment->account_name,
                'account_number' => $payment->account_number,
                'amount' => (float) $payment->amount,
                'formatted_amount' => 'Rp ' . number_format($payment->amount, 0, ',', '.'),
                'proof_image' => $payment->proof_image ? asset('storage/' . str_replace('\\', '/', $payment->proof_image)) : null,
                'status' => $payment->status,
                'notes' => $payment->notes,
                'rejection_reason' => $payment->rejection_reason,
                'created_at' => $payment->created_at->format('d M Y H:i'),
                'verified_at' => $payment->verified_at ? $payment->verified_at->format('d M Y H:i') : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    /**
     * Verify / approve payment.
     */
    public function verify(Request $request, $id)
    {
        $payment = Payment::with('order')->findOrFail($id);
        $admin = $request->user();

        $payment->status = 'diterima';
        $payment->verified_at = Carbon::now();
        $payment->verified_by = $admin->id;
        $payment->rejection_reason = null;
        $payment->save();

        if ($payment->order) {
            $payment->order->status = 'pembayaran_diterima';
            $payment->order->save();
        }

        return response()->json([
            'success' => true,
            'message' => "Pembayaran untuk pesanan {$payment->order->order_number} berhasil diverifikasi.",
            'payment' => $payment,
        ]);
    }

    /**
     * Reject payment with reason.
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $payment = Payment::with('order')->findOrFail($id);
        $admin = $request->user();

        $payment->status = 'ditolak';
        $payment->verified_at = Carbon::now();
        $payment->verified_by = $admin->id;
        $payment->rejection_reason = $validated['rejection_reason'];
        $payment->save();

        if ($payment->order) {
            $payment->order->status = 'menunggu_pembayaran';
            $payment->order->save();
        }

        return response()->json([
            'success' => true,
            'message' => "Pembayaran untuk pesanan {$payment->order->order_number} telah ditolak. Pelanggan dapat mengunggah bukti baru.",
            'payment' => $payment,
        ]);
    }
}
