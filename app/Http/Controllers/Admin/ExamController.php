<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(): Response
    {
        $exams = Exam::withCount(['questions', 'attempts as finished_attempts' => function ($q) {
            $q->whereNotNull('finished_at');
        }])
            ->latest()
            ->get()
            ->map(fn (Exam $e) => [
                'id' => $e->id,
                'title' => $e->title,
                'description' => $e->description,
                'duration_minutes' => $e->duration_minutes,
                'is_published' => $e->is_published,
                'questions_count' => $e->questions_count,
                'finished_attempts' => $e->finished_attempts,
            ]);

        return Inertia::render('Admin/Exams/Index', [
            'exams' => $exams,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Exams/Editor', [
            'exam' => null,
            'locked' => false,
        ]);
    }

    public function edit(Exam $exam): Response
    {
        $exam->load('questions.options');
        $hasAttempts = $exam->attempts()->exists();

        return Inertia::render('Admin/Exams/Editor', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'description' => $exam->description,
                'duration_minutes' => $exam->duration_minutes,
                'is_published' => $exam->is_published,
                'questions' => $exam->questions->map(fn ($q) => [
                    'statement' => $q->statement,
                    'correct_index' => $q->options->search(fn ($o) => $o->is_correct),
                    'options' => $q->options->map(fn ($o) => ['text' => $o->text])->values(),
                ])->values(),
            ],
            // Once a student has taken it, questions are frozen to preserve integrity.
            'locked' => $hasAttempts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatePayload($request);

        DB::transaction(function () use ($data, $request) {
            $exam = Exam::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'duration_minutes' => $data['duration_minutes'],
                'is_published' => $data['is_published'] ?? false,
                'created_by' => $request->user()->id,
            ]);

            $this->syncQuestions($exam, $data['questions']);
        });

        return redirect()->route('admin.exams.index')->with('flash', 'Prova criada com sucesso.');
    }

    public function update(Request $request, Exam $exam): RedirectResponse
    {
        $hasAttempts = $exam->attempts()->exists();

        if ($hasAttempts) {
            // Only metadata can change after attempts exist.
            $data = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'duration_minutes' => ['required', 'integer', 'min:1', 'max:600'],
                'is_published' => ['boolean'],
            ]);

            $exam->update($data);

            return redirect()->route('admin.exams.index')
                ->with('flash', 'Prova atualizada (questões bloqueadas: já possui tentativas).');
        }

        $data = $this->validatePayload($request);

        DB::transaction(function () use ($data, $exam) {
            $exam->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'duration_minutes' => $data['duration_minutes'],
                'is_published' => $data['is_published'] ?? false,
            ]);

            $exam->questions()->delete(); // cascades to options
            $this->syncQuestions($exam, $data['questions']);
        });

        return redirect()->route('admin.exams.index')->with('flash', 'Prova atualizada com sucesso.');
    }

    public function togglePublish(Exam $exam): RedirectResponse
    {
        if (! $exam->is_published && $exam->questions()->count() === 0) {
            return back()->withErrors(['publish' => 'Adicione ao menos uma questão antes de publicar.']);
        }

        $exam->update(['is_published' => ! $exam->is_published]);

        return back()->with('flash', $exam->is_published ? 'Prova publicada.' : 'Prova despublicada.');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return back()->with('flash', 'Prova removida.');
    }

    public function results(Exam $exam): Response
    {
        $attempts = $exam->attempts()
            ->with('user:id,name,email')
            ->latest('finished_at')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'student' => $a->user?->name,
                'email' => $a->user?->email,
                'status' => $a->status,
                'score' => $a->score,
                'correct_count' => $a->correct_count,
                'total_questions' => $a->total_questions,
                'started_at' => $a->started_at?->format('d/m/Y H:i'),
                'finished_at' => $a->finished_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Admin/Exams/Results', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'duration_minutes' => $exam->duration_minutes,
            ],
            'attempts' => $attempts,
        ]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:600'],
            'is_published' => ['boolean'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.statement' => ['required', 'string'],
            'questions.*.correct_index' => ['required', 'integer', 'min:0'],
            'questions.*.options' => ['required', 'array', 'min:2', 'max:6'],
            'questions.*.options.*.text' => ['required', 'string'],
        ], [], [
            'questions.*.statement' => 'enunciado',
            'questions.*.options' => 'alternativas',
            'questions.*.options.*.text' => 'texto da alternativa',
        ]);
    }

    private function syncQuestions(Exam $exam, array $questions): void
    {
        foreach ($questions as $qi => $q) {
            $question = $exam->questions()->create([
                'statement' => $q['statement'],
                'order' => $qi,
            ]);

            foreach ($q['options'] as $oi => $opt) {
                $question->options()->create([
                    'text' => $opt['text'],
                    'is_correct' => (int) $q['correct_index'] === $oi,
                    'order' => $oi,
                ]);
            }
        }
    }
}
