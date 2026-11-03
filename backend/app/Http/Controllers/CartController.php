<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;

class CartController extends Controller
{
    /**
     * Get base query for current user or session.
     */
    protected function getCartQuery()
    {
        if (auth()->check()) {
            return Cart::where('user_id', auth()->id());
        }

        $sessionId = session()->getId();
        return Cart::where('session_id', $sessionId);
    }

    /**
     * Display shopping cart.
     */
    public function index()
    {
        $cartItems = $this->getCartQuery()
            ->with('product.category')
            ->get();

        // Cek ketersediaan stok untuk setiap item
        $hasStockIssues = false;
        foreach ($cartItems as $item) {
            if (!$item->product || $item->quantity > $item->product->stock) {
                $hasStockIssues = true;
            }
        }

        $subtotal = $cartItems->sum(function ($item) {
            return $item->subtotal;
        });

        return view('frontend.cart.index', compact('cartItems', 'subtotal', 'hasStockIssues'));
    }

    /**
     * Add product to cart.
     */
    public function add(Request $request, $productId)
    {
        $request->validate([
            'quantity' => 'nullable|integer|min:1',
            'buy_now' => 'nullable|boolean',
        ]);

        $quantity = (int) $request->input('quantity', 1);
        $product = Product::findOrFail($productId);

        if (!$product->isInStock() || $product->stock <= 0) {
            return back()->with('error', 'Maaf, stok produk ' . $product->name . ' saat ini sedang habis.');
        }

        if ($quantity > $product->stock) {
            return back()->with('error', 'Jumlah yang ingin Anda beli (' . $quantity . ') melebihi stok yang tersedia (' . $product->stock . ').');
        }

        $cartQuery = $this->getCartQuery()->where('product_id', $productId);
        $existingItem = $cartQuery->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $quantity;
            if ($newQuantity > $product->stock) {
                return back()->with('error', 'Total di keranjang Anda (' . $newQuantity . ') melebihi batas stok tersedia (' . $product->stock . ').');
            }
            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            Cart::create([
                'user_id' => auth()->id(),
                'session_id' => auth()->check() ? null : session()->getId(),
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);
        }

        if ($request->boolean('buy_now')) {
            return redirect()->route('checkout.index')->with('success', 'Produk ditambahkan! Silakan selesaikan pemesanan Anda.');
        }

        return back()->with('success', 'Produk "' . $product->name . '" berhasil ditambahkan ke keranjang belanja!');
    }

    /**
     * Update quantity in cart.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = $this->getCartQuery()->findOrFail($id);
        $product = $item->product;

        if (!$product) {
            $item->delete();
            return back()->with('error', 'Produk tidak ditemukan atau sudah dihapus.');
        }

        $quantity = (int) $request->input('quantity');

        if ($quantity > $product->stock) {
            return back()->with('error', 'Jumlah yang diminta (' . $quantity . ') melebihi ketersediaan stok (' . $product->stock . ').');
        }

        $item->update(['quantity' => $quantity]);

        return back()->with('success', 'Jumlah produk di keranjang berhasil diperbarui.');
    }

    /**
     * Remove item from cart.
     */
    public function remove($id)
    {
        $item = $this->getCartQuery()->findOrFail($id);
        $productName = $item->product ? $item->product->name : 'Produk';
        $item->delete();

        return back()->with('success', '"' . $productName . '" telah dihapus dari keranjang.');
    }

    /**
     * Clear all items in cart.
     */
    public function clear()
    {
        $this->getCartQuery()->delete();
        return back()->with('success', 'Keranjang belanja berhasil dikosongkan.');
    }
}
