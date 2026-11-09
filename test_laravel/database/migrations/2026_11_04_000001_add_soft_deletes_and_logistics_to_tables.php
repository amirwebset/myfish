<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambahkan softDeletes pada produk jika belum ada
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'deleted_at')) {
            Schema::table('products', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
            });
        }

        // 2. Tambahkan softDeletes pada kategori jika belum ada
        if (Schema::hasTable('categories') && !Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
            });
        }

        // 3. Tambahkan kolom pendukung logistik & kode unik pada pesanan jika belum ada
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'shipping_courier')) {
                    $table->string('shipping_courier')->nullable()->after('payment_method');
                }
                if (!Schema::hasColumn('orders', 'shipping_cost')) {
                    $table->decimal('shipping_cost', 10, 2)->default(0)->after('shipping_courier');
                }
                if (!Schema::hasColumn('orders', 'packing_type')) {
                    $table->string('packing_type')->nullable()->after('shipping_cost');
                }
                if (!Schema::hasColumn('orders', 'packing_cost')) {
                    $table->decimal('packing_cost', 10, 2)->default(0)->after('packing_type');
                }
                if (!Schema::hasColumn('orders', 'unique_code')) {
                    $table->unsignedSmallInteger('unique_code')->default(0)->after('packing_cost');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products') && Schema::hasColumn('products', 'deleted_at')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'deleted_at')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn([
                    'shipping_courier',
                    'shipping_cost',
                    'packing_type',
                    'packing_cost',
                    'unique_code',
                ]);
            });
        }
    }
};

