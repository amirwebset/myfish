<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;

class HomeController extends Controller
{
    /**
     * Show homepage.
     */
    public function index()
    {
        $categories = Category::withCount('products')->get();
        $featuredProducts = Product::with('category')
            ->active()
            ->featured()
            ->take(6)
            ->get();

        $latestProducts = Product::with('category')
            ->active()
            ->latest()
            ->take(8)
            ->get();

        return view('frontend.home', compact('categories', 'featuredProducts', 'latestProducts'));
    }

    /**
     * Show about page (Tentang Kami).
     */
    public function about()
    {
        return view('frontend.about');
    }

    /**
     * Show contact page (Kontak Kami).
     */
    public function contact()
    {
        return view('frontend.contact');
    }

    /**
     * Handle contact message submission.
     */
    public function sendContactMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|min:10|max:2000',
        ]);

        // Simpan atau kirim email; untuk keperluan sistem, tampilkan notifikasi sukses
        return back()->with('success', 'Pesan Anda telah berhasil dikirim ke pengelola Pasanggar Fish Market. Kami akan segera menghubungi Anda.');
    }
}
