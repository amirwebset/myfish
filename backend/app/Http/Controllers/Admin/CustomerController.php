<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class CustomerController extends Controller
{
    /**
     * Display list of registered customers.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')->withCount('orders')->withSum(['orders' => function ($q) {
            $q->whereIn('status', ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai']);
        }], 'total_amount');

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")
                   ->orWhere('email', 'like', "%{$q}%")
                   ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $customers = $query->latest()->paginate(10)->withQueryString();

        return view('admin.customers.index', compact('customers'));
    }
}
