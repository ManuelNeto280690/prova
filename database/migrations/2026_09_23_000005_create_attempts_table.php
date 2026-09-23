<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            // in_progress | completed | expired
            $table->string('status', 20)->default('in_progress');
            $table->unsignedInteger('total_questions')->default(0);
            $table->unsignedInteger('correct_count')->default(0);
            $table->unsignedInteger('score')->default(0); // 0-100
            $table->timestamps();

            // One attempt per student per exam — enforces "no retake".
            $table->unique(['user_id', 'exam_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempts');
    }
};
