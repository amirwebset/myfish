<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;

class ProductCatalogController extends Controller
{
    /**
     * Display product catalog with search, filter, and sorting.
     */
    public function index(Request $request)
    {
        $categories = Category::withCount('products')->get();

        $query = Product::with('category')->active();

        // 1. Pencarian berdasarkan nama produk atau deskripsi
        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 2. Filter Kategori
        if ($request->filled('kategori')) {
            $catSlug = $request->input('kategori');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        // 3. Filter Rentang Harga
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        // 4. Pengurutan Produk
        $sort = $request->input('sort', 'terbaru');
        switch ($sort) {
            case 'harga_rendah':
                $query->orderBy('price', 'asc');
                break;
            case 'harga_tinggi':
                $query->orderBy('price', 'desc');
                break;
            case 'nama_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'terbaru':
            default:
                $query->latest();
                break;
        }

        $products = $query->paginate(9)->withQueryString();

        return view('frontend.catalog.index', compact('products', 'categories'));
    }

    /**
     * Display product detail page.
     */
    public function show($slug)
    {
        $product = Product::with('category')
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Rekomendasi produk terkait dari kategori yang sama
        $relatedProducts = Product::with('category')
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        return view('frontend.catalog.show', compact('product', 'relatedProducts'));
    }
}
