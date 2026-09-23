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
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'duration_minutes' => 'integer',
        ];
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
