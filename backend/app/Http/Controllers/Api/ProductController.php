<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Get products catalog with search, filter, and sorting.
     */
    public function index(Request $request)
    {
        $query = Product::with('category')->where('is_active', true);

        // Filter: Category
        if ($request->filled('category')) {
            $categoryVal = $request->query('category');
            $query->whereHas('category', function ($q) use ($categoryVal) {
                if (is_numeric($categoryVal)) {
                    $q->where('id', $categoryVal);
                } else {
                    $q->where('slug', $categoryVal);
                }
            });
        }

        // Search: Name or Description
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter: Price Range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->query('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->query('max_price'));
        }

        // Sorting
        $sort = $request->query('sort', 'latest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $perPage = $request->query('per_page', 12);
        $products = $query->paginate($perPage);

        // Append image_url and formatted_price
        $products->getCollection()->transform(function ($product) {
            $product->image_url = $product->image_url;
            $product->formatted_price = $product->formatted_price;
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get featured products for homepage.
     */
    public function featured()
    {
        $featured = Product::with('category')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(8)
            ->get();

        // If fewer than 4 featured, fall back to recent active products
        if ($featured->count() < 4) {
            $featured = Product::with('category')
                ->where('is_active', true)
                ->latest()
                ->take(8)
                ->get();
        }

        $featured->transform(function ($product) {
            $product->image_url = $product->image_url;
            $product->formatted_price = $product->formatted_price;
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $featured,
        ]);
    }

    /**
     * Show single product detail by slug or id.
     */
    public function show($identifier)
    {
        $query = Product::with('category')->where('is_active', true);

        if (is_numeric($identifier)) {
            $product = $query->where('id', $identifier)->firstOrFail();
        } else {
            $product = $query->where('slug', $identifier)->firstOrFail();
        }

        $product->image_url = $product->image_url;
        $product->formatted_price = $product->formatted_price;

        // Related products in the same category
        $related = Product::with('category')
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        $related->transform(function ($p) {
            $p->image_url = $p->image_url;
            $p->formatted_price = $p->formatted_price;
            return $p;
        });

        return response()->json([
            'success' => true,
            'data' => $product,
            'related' => $related,
        ]);
    }
}
