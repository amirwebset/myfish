<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\OrderItem;

class ReportController extends Controller
{
    /**
     * Display sales report with date range filters and statistics.
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        $status = $request->input('status', 'all');

        $query = Order::with(['user', 'items'])
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        if ($status !== 'all') {
            $query->where('status', $status);
        } else {
            // Default laporan penjualan fokus pada pesanan yang sudah dibayar atau selesai
            $query->whereIn('status', ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai']);
        }

        $orders = $query->latest()->get();

        $totalRevenue = $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $totalItemsSold = $orders->sum(function ($order) {
            return $order->items->sum('quantity');
        });

        return view('admin.reports.index', compact(
            'orders',
            'startDate',
            'endDate',
            'status',
            'totalRevenue',
            'totalOrders',
            'totalItemsSold'
        ));
    }
}
