<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            // When the exam becomes available to start.
            // null = liberada assim que publicada (comportamento imediato).
            $table->timestamp('available_at')->nullable()->after('is_published');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn('available_at');
        });
    }
};
