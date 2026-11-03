<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;

use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;

/*
|--------------------------------------------------------------------------
| IKANKU REST API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

// Autentikasi Publik
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Kategori Publik
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Produk Publik
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{identifier}', [ProductController::class, 'show']);

// Keranjang Belanja (mendukung guest & user)
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart/add', [CartController::class, 'add']);
Route::put('/cart/update/{id}', [CartController::class, 'update']);
Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);
Route::delete('/cart/clear', [CartController::class, 'clear']);


// ==========================================
// 2. AUTHENTICATED CUSTOMER ROUTES
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // Profil & Akun
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'process']);

    // Riwayat & Detail Pesanan Pelanggan
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);

    // Unggah Bukti Pembayaran
    Route::post('/orders/{orderNumber}/payment', [PaymentController::class, 'submit']);
});


// ==========================================
// 3. ADMINISTRATOR ROUTES (Protected by 'admin' middleware)
// ==========================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Ringkasan Dashboard & Statistik
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Manajemen Produk
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{id}', [AdminProductController::class, 'show']);
    Route::post('/products/{id}', [AdminProductController::class, 'update']); // for multipart file upload
    Route::put('/products/{id}', [AdminProductController::class, 'update']);
    Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

    // Manajemen Kategori
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    // Manajemen Pesanan & Status
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    // Verifikasi Pembayaran
    Route::get('/payments', [AdminPaymentController::class, 'index']);
    Route::post('/payments/{id}/verify', [AdminPaymentController::class, 'verify']);
    Route::post('/payments/{id}/reject', [AdminPaymentController::class, 'reject']);

    // Data Pelanggan
    Route::get('/customers', [AdminCustomerController::class, 'index']);

    // Laporan Penjualan
    Route::get('/reports', [AdminReportController::class, 'index']);
});
