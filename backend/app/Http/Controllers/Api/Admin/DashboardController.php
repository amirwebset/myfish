<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\User;
use App\Models\Payment;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard summary statistics and recent orders.
     */
    public function index()
    {
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();

        // Total revenue from verified/completed orders
        $totalRevenue = Order::whereIn('status', ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai'])
            ->sum('total_amount');

        // Status counts
        $statusCounts = [
            'menunggu_pembayaran' => Order::where('status', 'menunggu_pembayaran')->count(),
            'menunggu_verifikasi' => Order::where('status', 'menunggu_verifikasi')->count(),
            'pembayaran_diterima' => Order::where('status', 'pembayaran_diterima')->count(),
            'diproses' => Order::where('status', 'diproses')->count(),
            'dikirim' => Order::where('status', 'dikirim')->count(),
            'selesai' => Order::where('status', 'selesai')->count(),
            'dibatalkan' => Order::where('status', 'dibatalkan')->count(),
        ];

        // Low stock products alert (stock <= 5)
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->where('is_active', true)
            ->select('id', 'name', 'stock', 'price')
            ->get();

        // Recent 5 orders
        $recentOrders = Order::with(['user', 'payment'])
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->recipient_name,
                    'customer_email' => $order->user ? $order->user->email : '-',
                    'total_amount' => (float) $order->total_amount,
                    'formatted_total' => $order->formatted_total,
                    'status' => $order->status,
                    'status_label' => $order->status_label,
                    'created_at' => $order->created_at->format('d M Y H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'summary' => [
                'total_products' => $totalProducts,
                'total_categories' => $totalCategories,
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'total_revenue' => (float) $totalRevenue,
                'formatted_revenue' => 'Rp ' . number_format($totalRevenue, 0, ',', '.'),
            ],
            'status_counts' => $statusCounts,
            'low_stock_products' => $lowStockProducts,
            'recent_orders' => $recentOrders,
        ]);
    }
}
