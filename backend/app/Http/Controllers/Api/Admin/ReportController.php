<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Order;

class ReportController extends Controller
{
    /**
     * Get sales report by date range with statistics.
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        $status = $request->input('status', 'all');

        $query = Order::with(['user', 'items.product'])
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        if ($status !== 'all') {
            $query->where('status', $status);
        } else {
            // Default report includes paid/in-process/shipped/completed orders
            $query->whereIn('status', ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai']);
        }

        $orders = $query->latest()->get();

        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $totalItemsSold = $orders->sum(function ($order) {
            return $order->items->sum('quantity');
        });

        $formattedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'recipient_name' => $order->recipient_name,
                'customer_email' => $order->user ? $order->user->email : '-',
                'total_amount' => (float) $order->total_amount,
                'formatted_total' => $order->formatted_total,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'items_count' => $order->items->sum('quantity'),
                'created_at' => $order->created_at->format('d M Y H:i'),
                'items' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'price' => (float) $item->product_price,
                        'quantity' => $item->quantity,
                        'subtotal' => (float) $item->subtotal,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'formatted_revenue' => 'Rp ' . number_format($totalRevenue, 0, ',', '.'),
                'total_orders' => $totalOrders,
                'total_items_sold' => $totalItemsSold,
            ],
            'orders' => $formattedOrders,
        ]);
    }
}
