<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class CheckoutController extends Controller
{
    /**
     * Display checkout page.
     */
    public function index()
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('info', 'Silakan login terlebih dahulu untuk melanjutkan proses checkout.');
        }

        // Migrasikan item keranjang session ke user id jika ada
        Cart::where('session_id', session()->getId())
            ->whereNull('user_id')
            ->update(['user_id' => auth()->id(), 'session_id' => null]);

        $cartItems = Cart::where('user_id', auth()->id())
            ->with('product')
            ->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('warning', 'Keranjang belanja Anda masih kosong. Silakan pilih produk terlebih dahulu.');
        }

        // Validasi stok sebelum membuka halaman checkout
        foreach ($cartItems as $item) {
            if (!$item->product || $item->quantity > $item->product->stock) {
                return redirect()->route('cart.index')->with('error', 'Stok untuk produk "' . ($item->product->name ?? 'Produk') . '" tidak mencukupi. Mohon sesuaikan kuantitas.');
            }
        }

        $totalAmount = $cartItems->sum(function ($item) {
            return $item->subtotal;
        });

        $user = auth()->user();

        return view('frontend.checkout.index', compact('cartItems', 'totalAmount', 'user'));
    }

    /**
     * Process checkout and create order atomically.
     */
    public function store(Request $request)
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|min:10|max:500',
            'notes' => 'nullable|string|max:500',
            'payment_method' => 'required|string|in:bank_transfer',
        ]);

        $cartItems = Cart::where('user_id', auth()->id())
            ->with('product')
            ->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('warning', 'Keranjang belanja Anda kosong.');
        }

        // Mulai transaksi database untuk menjamin integritas data stok dan pesanan
        try {
            $order = DB::transaction(function () use ($validated, $cartItems) {
                $totalCalculated = 0;

                // 1. Verifikasi ketersediaan stok aktual dan hitung total di sisi server
                foreach ($cartItems as $item) {
                    $product = Product::lockForUpdate()->find($item->product_id);

                    if (!$product || $product->stock < $item->quantity) {
                        throw new \Exception('Stok untuk produk "' . ($product->name ?? 'Ikan Hias') . '" tidak mencukupi saat proses pesanan.');
                    }

                    $totalCalculated += ($product->price * $item->quantity);
                }

                // 2. Buat nomor pesanan unik
                $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5));

                // 3. Simpan data Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => auth()->id(),
                    'recipient_name' => $validated['recipient_name'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'notes' => $validated['notes'] ?? null,
                    'total_amount' => $totalCalculated,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'menunggu_pembayaran',
                ]);

                // 4. Simpan Order Items (Snapshot harga dan nama) & Kurangi Stok
                foreach ($cartItems as $item) {
                    $product = Product::find($item->product_id);

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $product->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $product->price * $item->quantity,
                    ]);

                    // Kurangi stok produk secara aman
                    $product->decrement('stock', $item->quantity);
                }

                // 5. Kosongkan keranjang belanja pengguna
                Cart::where('user_id', auth()->id())->delete();

                return $order;
            });

            return redirect()->route('orders.show', $order->order_number)->with('success', 'Pesanan Anda dengan nomor ' . $order->order_number . ' berhasil dibuat! Silakan lakukan pembayaran dan unggah bukti transfer.');

        } catch (\Exception $e) {
            return redirect()->route('cart.index')->with('error', 'Gagal memproses pesanan: ' . $e->getMessage());
        }
    }
}
