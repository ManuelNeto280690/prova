<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attempt extends Model
{
    use HasFactory;

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'user_id',
        'exam_id',
        'started_at',
        'finished_at',
        'status',
        'total_questions',
        'correct_count',
        'score',
        'violations_count',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function isFinished(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_EXPIRED], true);
    }

    /**
     * Seconds remaining based on the SERVER clock. Never trusts the browser.
     */
    public function secondsRemaining(): int
    {
        if ($this->exam && $this->exam->activated_at) {
            return $this->exam->secondsRemaining();
        }

        if (! $this->started_at) {
            return $this->exam ? $this->exam->duration_minutes * 60 : 0;
        }

        $deadline = $this->started_at->copy()->addMinutes($this->exam->duration_minutes);

        return max(0, now()->diffInSeconds($deadline, false));
    }
}
