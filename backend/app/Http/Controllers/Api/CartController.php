<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;

class CartController extends Controller
{
    /**
     * Resolve cart query based on user or session_id.
     */
    protected function getCartQuery(Request $request)
    {
        $user = $request->user('sanctum');
        $sessionId = $request->header('X-Session-ID') ?: $request->input('session_id');

        if ($user) {
            return Cart::where('user_id', $user->id);
        }

        if ($sessionId) {
            return Cart::where('session_id', $sessionId);
        }

        return Cart::whereRaw('1 = 0');
    }

    /**
     * Get cart contents with calculated subtotals.
     */
    public function index(Request $request)
    {
        $items = $this->getCartQuery($request)->with('product.category')->get();

        $subtotal = 0;
        $formattedItems = [];

        foreach ($items as $item) {
            if (!$item->product || !$item->product->is_active) {
                continue;
            }

            $itemSubtotal = $item->product->price * $item->quantity;
            $subtotal += $itemSubtotal;

            $formattedItems[] = [
                'id' => $item->id,
                'product_id' => $item->product->id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'price' => (float) $item->product->price,
                'formatted_price' => $item->product->formatted_price,
                'image_url' => $item->product->image_url,
                'stock' => $item->product->stock,
                'quantity' => $item->quantity,
                'subtotal' => $itemSubtotal,
                'formatted_subtotal' => 'Rp ' . number_format($itemSubtotal, 0, ',', '.'),
                'is_in_stock' => $item->product->stock >= $item->quantity,
            ];
        }

        return response()->json([
            'success' => true,
            'items' => $formattedItems,
            'count' => count($formattedItems),
            'total_quantity' => array_sum(array_column($formattedItems, 'quantity')),
            'subtotal' => $subtotal,
            'formatted_subtotal' => 'Rp ' . number_format($subtotal, 0, ',', '.'),
        ]);
    }

    /**
     * Add product to cart with stock validation.
     */
    public function add(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
            'session_id' => 'nullable|string',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak tersedia untuk dibeli.',
            ], 422);
        }

        $qtyToAdd = $validated['quantity'] ?? 1;
        $user = $request->user('sanctum');
        $sessionId = $request->header('X-Session-ID') ?: ($validated['session_id'] ?? null);

        if (!$user && !$sessionId) {
            $sessionId = uniqid('sess_', true);
        }

        // Check if item already exists in cart
        $cartItem = Cart::where(function ($q) use ($user, $sessionId) {
            if ($user) {
                $q->where('user_id', $user->id);
            } else {
                $q->where('session_id', $sessionId);
            }
        })->where('product_id', $product->id)->first();

        $newQuantity = $cartItem ? ($cartItem->quantity + $qtyToAdd) : $qtyToAdd;

        // Stock check
        if ($newQuantity > $product->stock) {
            return response()->json([
                'success' => false,
                'message' => "Stok produk tidak mencukupi. Sisa stok tersedia: {$product->stock}.",
            ], 422);
        }

        if ($cartItem) {
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            $cartItem = Cart::create([
                'user_id' => $user ? $user->id : null,
                'session_id' => $user ? null : $sessionId,
                'product_id' => $product->id,
                'quantity' => $newQuantity,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "{$product->name} berhasil ditambahkan ke keranjang.",
            'session_id' => $sessionId,
            'cart_item' => $cartItem,
        ]);
    }

    /**
     * Update quantity of a cart item.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = $this->getCartQuery($request)->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        $product = $cartItem->product;
        if ($validated['quantity'] > $product->stock) {
            return response()->json([
                'success' => false,
                'message' => "Jumlah melebihi stok tersedia ({$product->stock}).",
            ], 422);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        return response()->json([
            'success' => true,
            'message' => 'Jumlah produk diperbarui.',
        ]);
    }

    /**
     * Remove item from cart.
     */
    public function remove(Request $request, $id)
    {
        $cartItem = $this->getCartQuery($request)->where('id', $id)->first();

        if ($cartItem) {
            $cartItem->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Item dihapus dari keranjang.',
        ]);
    }

    /**
     * Clear all items in cart.
     */
    public function clear(Request $request)
    {
        $this->getCartQuery($request)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Keranjang berhasil dikosongkan.',
        ]);
    }
}
