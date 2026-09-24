<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    /**
     * Student dashboard: published exams as cards + this student's status.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $attempts = $user->attempts()->get()->keyBy('exam_id');

        $exams = Exam::where('is_published', true)
            ->withCount('questions')
            ->latest()
            ->get()
            ->map(function (Exam $exam) use ($attempts) {
                $attempt = $attempts->get($exam->id);

                return [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'description' => $exam->description,
                    'duration_minutes' => $exam->duration_minutes,
                    'questions_count' => $exam->questions_count,
                    'released' => $exam->isAvailable(),
                    'available_at' => $exam->available_at?->format('d/m/Y \à\s H:i'),
                    'attempt' => $attempt ? [
                        'status' => $attempt->status,
                        'score' => $attempt->score,
                        'finished' => $attempt->isFinished(),
                    ] : null,
                ];
            });

        return Inertia::render('Student/Dashboard', [
            'exams' => $exams,
        ]);
    }

    /**
     * Start (or resume) an attempt, then send the student into the exam.
     */
    public function start(Request $request, Exam $exam): RedirectResponse
    {
        abort_unless($exam->is_published, 404);

        $attempt = Attempt::firstOrNew([
            'user_id' => $request->user()->id,
            'exam_id' => $exam->id,
        ]);

        // Single-attempt rule: a finished exam can never be reopened.
        if ($attempt->exists && $attempt->isFinished()) {
            return redirect()->route('exam.show', $exam)
                ->with('flash', 'Você já concluiu esta prova.');
        }

        // Scheduled release: cannot start before the admin-defined time.
        // (Server-side guard — the front-end also blocks it.)
        if (! $attempt->exists && ! $exam->isAvailable()) {
            $when = $exam->available_at?->format('d/m/Y \à\s H:i');

            return redirect()->route('student.dashboard')->with(
                'warning',
                $when
                    ? "A prova ainda não foi liberada. Ela estará disponível em {$when}."
                    : 'A prova ainda não foi liberada pelo administrador.'
            );
        }

        if (! $attempt->exists) {
            if ($exam->questions()->count() === 0) {
                return redirect()->route('student.dashboard')
                    ->withErrors(['exam' => 'Esta prova ainda não possui questões.']);
            }

            $attempt->started_at = now();
            $attempt->status = Attempt::STATUS_IN_PROGRESS;
            $attempt->total_questions = $exam->questions()->count();
            $attempt->save();
        }

        return redirect()->route('exam.show', $exam);
    }

    /**
     * Render the exam-taking screen, or the result if already finished.
     */
    public function show(Request $request, Exam $exam): Response|RedirectResponse
    {
        $attempt = Attempt::where('user_id', $request->user()->id)
            ->where('exam_id', $exam->id)
            ->first();

        if (! $attempt) {
            // No attempt yet and not released → send back with a notice.
            if (! $exam->isAvailable()) {
                return redirect()->route('student.dashboard')
                    ->with('warning', 'A prova ainda não foi liberada pelo administrador.');
            }

            return redirect()->route('student.dashboard');
        }

        // Server clock decides everything. If time is already up, finalize now.
        if (! $attempt->isFinished() && $attempt->secondsRemaining() <= 0) {
            $this->finalize($attempt, $exam, [], Attempt::STATUS_EXPIRED);
        }

        if ($attempt->isFinished()) {
            return Inertia::render('Student/ExamResult', [
                'exam' => ['id' => $exam->id, 'title' => $exam->title],
                'result' => [
                    'status' => $attempt->status,
                    'score' => $attempt->score,
                    'correct_count' => $attempt->correct_count,
                    'total_questions' => $attempt->total_questions,
                    'finished_at' => $attempt->finished_at?->format('d/m/Y H:i'),
                ],
            ]);
        }

        $exam->load('questions.options');

        return Inertia::render('Student/ExamTake', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'description' => $exam->description,
                'duration_minutes' => $exam->duration_minutes,
            ],
            // Correct answers are NEVER sent to the browser.
            'questions' => $exam->questions->map(fn ($q) => [
                'id' => $q->id,
                'statement' => $q->statement,
                'options' => $q->options->map(fn ($o) => [
                    'id' => $o->id,
                    'text' => $o->text,
                ])->values(),
            ])->values(),
            'secondsRemaining' => $attempt->secondsRemaining(),
            'violationsCount' => (int) ($attempt->violations_count ?? 0),
        ]);
    }

    /**
     * Record a security violation (e.g. exit fullscreen, tab switch).
     */
    public function recordViolation(Request $request, Exam $exam): \Illuminate\Http\JsonResponse
    {
        $attempt = Attempt::where('user_id', $request->user()->id)
            ->where('exam_id', $exam->id)
            ->first();

        if ($attempt && ! $attempt->isFinished()) {
            $attempt->increment('violations_count');

            return response()->json([
                'success' => true,
                'violations_count' => $attempt->violations_count,
            ]);
        }

        return response()->json(['success' => false], 400);
    }

    /**
     * Submit answers. Grades server-side and locks the attempt forever.
     * `auto` = the client timer hit zero (or the student ran out of time).
     */
    public function submit(Request $request, Exam $exam): RedirectResponse
    {
        $attempt = Attempt::where('user_id', $request->user()->id)
            ->where('exam_id', $exam->id)
            ->first();

        if (! $attempt || $attempt->isFinished()) {
            return redirect()->route('exam.show', $exam);
        }

        $validated = $request->validate([
            'answers' => ['array'],
            'answers.*' => ['nullable', 'integer'],
            'auto' => ['boolean'],
            'violations_count' => ['nullable', 'integer'],
        ]);

        if (isset($validated['violations_count']) && $validated['violations_count'] > $attempt->violations_count) {
            $attempt->violations_count = $validated['violations_count'];
            $attempt->save();
        }

        // Even a manual submit is treated as expired if the server clock is up.
        $expired = $attempt->secondsRemaining() <= 0 || ($validated['auto'] ?? false);

        $this->finalize(
            $attempt,
            $exam,
            $validated['answers'] ?? [],
            $expired ? Attempt::STATUS_EXPIRED : Attempt::STATUS_COMPLETED
        );

        return redirect()->route('exam.show', $exam);
    }

    /**
     * Grade the attempt against the answer key and freeze it.
     *
     * @param  array<int,int|null>  $answers  question_id => option_id
     */
    private function finalize(Attempt $attempt, Exam $exam, array $answers, string $status): void
    {
        $exam->loadMissing('questions.options');

        DB::transaction(function () use ($attempt, $exam, $answers, $status) {
            $correct = 0;

            foreach ($exam->questions as $question) {
                $selectedId = $answers[$question->id] ?? null;
                $selectedOption = $selectedId
                    ? $question->options->firstWhere('id', (int) $selectedId)
                    : null;

                $isCorrect = $selectedOption?->is_correct ?? false;
                if ($isCorrect) {
                    $correct++;
                }

                $attempt->answers()->updateOrCreate(
                    ['question_id' => $question->id],
                    [
                        'option_id' => $selectedOption?->id,
                        'is_correct' => $isCorrect,
                    ]
                );
            }

            $total = $exam->questions->count();

            $attempt->update([
                'status' => $status,
                'finished_at' => now(),
                'total_questions' => $total,
                'correct_count' => $correct,
                'score' => $total > 0 ? (int) round(($correct / $total) * 100) : 0,
            ]);
        });
    }
}
