<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Product;

class CancelExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Otomatis membatalkan pesanan yang belum dibayar lewat dari 24 jam dan mengembalikan kuota stok ikan';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Memeriksa pesanan kedaluwarsa...');

        // Ambil pesanan berstatus 'menunggu_pembayaran' yang telah melewati 24 jam
        $expiredOrders = Order::where('status', 'menunggu_pembayaran')
            ->where('created_at', '<', now()->subHours(24))
            ->with('items')
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('Tidak ada pesanan kedaluwarsa.');
            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($expiredOrders as $order) {
            DB::transaction(function () use ($order) {
                $order->status = 'dibatalkan';
                $autoNote = '[Sistem: Dibatalkan otomatis karena melewati batas waktu pembayaran 24 jam. Stok telah dikembalikan.]';
                $order->notes = $order->notes ? ($order->notes . ' | ' . $autoNote) : $autoNote;
                $order->save();

                // Kembalikan kuota stok produk ikan
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            });
            $count++;
            $this->line("Pesanan #{$order->order_number} berhasil dibatalkan dan stok dikembalikan.");
        }

        $this->info("Total {$count} pesanan kedaluwarsa berhasil dibatalkan.");
        return Command::SUCCESS;
    }
}

