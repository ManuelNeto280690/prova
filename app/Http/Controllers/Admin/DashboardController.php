<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\Exam;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $recentAttempts = Attempt::with(['user:id,name,email', 'exam:id,title'])
            ->whereNotNull('finished_at')
            ->latest('finished_at')
            ->limit(6)
            ->get()
            ->map(fn (Attempt $a) => [
                'id' => $a->id,
                'student' => $a->user?->name,
                'exam' => $a->exam?->title,
                'score' => $a->score,
                'status' => $a->status,
                'finished_at' => $a->finished_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'students' => User::where('role', User::ROLE_STUDENT)->count(),
                'exams' => Exam::count(),
                'published' => Exam::where('is_published', true)->count(),
                'attempts' => Attempt::whereNotNull('finished_at')->count(),
            ],
            'recentAttempts' => $recentAttempts,
        ]);
    }
}
