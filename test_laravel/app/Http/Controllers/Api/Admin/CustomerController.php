<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class CustomerController extends Controller
{
    /**
     * List all customers with orders summary.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')
            ->withCount('orders')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->paginate(20);

        $customers->getCollection()->transform(function ($customer) {
            $totalSpent = $customer->orders()
                ->whereIn('status', ['pembayaran_diterima', 'diproses', 'dikirim', 'selesai'])
                ->sum('total_amount');

            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone ?? '-',
                'address' => $customer->address ?? '-',
                'orders_count' => $customer->orders_count,
                'total_spent' => (float) $totalSpent,
                'formatted_total_spent' => 'Rp ' . number_format($totalSpent, 0, ',', '.'),
                'created_at' => $customer->created_at->format('d M Y'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'total' => $customers->total(),
            ],
        ]);
    }
}
