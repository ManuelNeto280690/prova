<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\StudentCredentialsMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(): Response
    {
        $students = User::where('role', User::ROLE_STUDENT)
            ->withCount(['attempts as finished_attempts' => function ($q) {
                $q->whereNotNull('finished_at');
            }])
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'must_change_password' => $u->must_change_password,
                'finished_attempts' => $u->finished_attempts,
                'created_at' => $u->created_at?->format('d/m/Y'),
            ]);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
        ]);

        // Strong random temporary password.
        $plainPassword = Str::password(12);

        $student = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => User::ROLE_STUDENT,
            'password' => $plainPassword, // hashed via cast
            'must_change_password' => true,
        ]);

        $this->deliverCredentials($student->name, $student->email, $plainPassword);

        // Password is shown ONCE to the admin so it can be relayed to the student.
        return back()->with('generatedCredential', [
            'name' => $student->name,
            'email' => $student->email,
            'password' => $plainPassword,
        ]);
    }

    public function resetPassword(User $student): RedirectResponse
    {
        abort_unless($student->isStudent(), 404);

        $plainPassword = Str::password(12);
        $student->update([
            'password' => $plainPassword,
            'must_change_password' => true,
        ]);

        $this->deliverCredentials($student->name, $student->email, $plainPassword);

        return back()->with('generatedCredential', [
            'name' => $student->name,
            'email' => $student->email,
            'password' => $plainPassword,
        ]);
    }

    public function destroy(User $student): RedirectResponse
    {
        abort_unless($student->isStudent(), 404);

        $student->delete();

        return back()->with('flash', 'Aluno removido.');
    }

    /**
     * Best-effort e-mail delivery. Never breaks student creation if mail
     * isn't configured — the admin always gets the password on screen.
     */
    private function deliverCredentials(string $name, string $email, string $password): void
    {
        try {
            Mail::to($email)->send(new StudentCredentialsMail(
                studentName: $name,
                email: $email,
                password: $password,
                loginUrl: route('login'),
            ));
        } catch (\Throwable $e) {
            Log::warning('Falha ao enviar credenciais por e-mail: '.$e->getMessage());
        }
    }
}
