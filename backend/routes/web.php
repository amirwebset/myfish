<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductCatalogController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;

/*
|--------------------------------------------------------------------------
| Web Routes - Pasanggar Fish Market
|--------------------------------------------------------------------------
*/

// 1. Rute Halaman Publik
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/tentang', [HomeController::class, 'about'])->name('about');
Route::get('/kontak', [HomeController::class, 'contact'])->name('contact');
Route::post('/kontak/kirim', [HomeController::class, 'sendContactMessage'])->name('contact.send');

// 2. Katalog Produk
Route::get('/katalog', [ProductCatalogController::class, 'index'])->name('catalog.index');
Route::get('/katalog/{slug}', [ProductCatalogController::class, 'show'])->name('catalog.show');

// 3. Keranjang Belanja
Route::get('/keranjang', [CartController::class, 'index'])->name('cart.index');
Route::post('/keranjang/tambah/{productId}', [CartController::class, 'add'])->name('cart.add');
Route::post('/keranjang/update/{id}', [CartController::class, 'update'])->name('cart.update');
Route::post('/keranjang/hapus/{id}', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/keranjang/kosongkan', [CartController::class, 'clear'])->name('cart.clear');

// 4. Autentikasi Pengguna
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// 5. Area Khusus Pelanggan Terautentikasi
Route::middleware('auth')->group(function () {
    Route::get('/profil', [AuthController::class, 'profile'])->name('profile');
    Route::post('/profil/update', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::post('/profil/password', [AuthController::class, 'updatePassword'])->name('profile.password');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/pesanan', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/pesanan/{orderNumber}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/pesanan/{orderNumber}/upload-bukti', [OrderController::class, 'uploadPayment'])->name('orders.upload_payment');
});

// 6. Area Administrator (Dilindungi Middleware Auth & Admin)
Route::middleware(['auth', 'admin'])->prefix('admin')->as('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Pengelolaan Produk
    Route::get('/produk', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/produk/tambah', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/produk', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/produk/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/produk/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::delete('/produk/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/produk/{product}/stok', [AdminProductController::class, 'updateStock'])->name('products.update_stock');

    // Pengelolaan Kategori
    Route::get('/kategori', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/kategori', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/kategori/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/kategori/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    // Pengelolaan Pesanan & Verifikasi Pembayaran
    Route::get('/pesanan', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/pesanan/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::post('/pesanan/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update_status');
    Route::post('/pesanan/{order}/verifikasi-pembayaran', [AdminOrderController::class, 'verifyPayment'])->name('orders.verify_payment');

    // Pengelolaan Pelanggan
    Route::get('/pelanggan', [AdminCustomerController::class, 'index'])->name('customers.index');

    // Laporan Penjualan
    Route::get('/laporan', [AdminReportController::class, 'index'])->name('reports.index');
});

// File server fallback for uploaded product images and payment proofs
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');
