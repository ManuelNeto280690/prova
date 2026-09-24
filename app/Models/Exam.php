<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'duration_minutes',
        'is_published',
        'is_active',
        'activated_at',
        'available_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'is_active' => 'boolean',
            'activated_at' => 'datetime',
            'duration_minutes' => 'integer',
            'available_at' => 'datetime',
        ];
    }

    /**
     * Seconds remaining for the entire exam based on collective activation.
     */
    public function secondsRemaining(): int
    {
        if (! $this->activated_at) {
            return $this->duration_minutes * 60;
        }

        $deadline = $this->activated_at->copy()->addMinutes($this->duration_minutes);

        return max(0, now()->diffInSeconds($deadline, false));
    }

    /**
     * A prova está liberada agora?
     * Precisa estar publicada, ativada pelo professor e dentro do tempo.
     */
    public function isAvailable(): bool
    {
        if (! $this->is_published || ! $this->is_active || ! $this->activated_at) {
            return false;
        }

        return $this->secondsRemaining() > 0;
    }

    /**
     * A prova expirou pelo tempo limite?
     */
    public function isExpired(): bool
    {
        if (! $this->activated_at) {
            return false;
        }

        return $this->secondsRemaining() <= 0;
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
