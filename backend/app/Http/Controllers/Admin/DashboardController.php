<?php

namespace App\Http\Controllers\Admin;

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
     * Display admin dashboard overview.
     */
    public function index()
    {
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();

        // Total omset penjualan dari pesanan yang sudah terverifikasi / selesai
        $totalRevenue = Order::whereIn('status', ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai'])
            ->sum('total_amount');

        // Pesanan yang menunggu verifikasi bukti pembayaran
        $pendingVerifications = Order::where('status', 'menunggu_verifikasi')->count();

        // Pesanan yang menunggu pembayaran awal
        $pendingPayments = Order::where('status', 'menunggu_pembayaran')->count();

        // Produk dengan stok menipis (<= 5 ekor)
        $lowStockProducts = Product::where('stock', '<=', 5)->with('category')->take(5)->get();

        // 6 Pesanan Terbaru
        $recentOrders = Order::with(['user', 'payment'])
            ->latest()
            ->take(6)
            ->get();

        return view('admin.dashboard', compact(
            'totalProducts',
            'totalCategories',
            'totalOrders',
            'totalCustomers',
            'totalRevenue',
            'pendingVerifications',
            'pendingPayments',
            'lowStockProducts',
            'recentOrders'
        ));
    }
}
