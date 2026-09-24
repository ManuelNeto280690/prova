<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExamController as AdminExamController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Auth\FirstAccessController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\ExamController as StudentExamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
    ]);
})->name('home');

/*
|--------------------------------------------------------------------------
| First access — forced password change
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('first-access', [FirstAccessController::class, 'show'])->name('first-access');
    Route::post('first-access', [FirstAccessController::class, 'update'])->name('first-access.update');
});

/*
|--------------------------------------------------------------------------
| Role-based entry point
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    return auth()->user()->isAdmin()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('student.dashboard');
})->middleware('auth')->name('dashboard');

/*
|--------------------------------------------------------------------------
| Student area
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/painel', [StudentExamController::class, 'index'])->name('student.dashboard');
    Route::post('/provas/{exam}/iniciar', [StudentExamController::class, 'start'])->name('exam.start');
    Route::get('/provas/{exam}', [StudentExamController::class, 'show'])->name('exam.show');
    Route::post('/provas/{exam}/enviar', [StudentExamController::class, 'submit'])->name('exam.submit');
    Route::post('/provas/{exam}/registrar-violacao', [StudentExamController::class, 'recordViolation'])->name('exam.violation');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Admin area — protected by the `admin` middleware
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Students
    Route::get('/alunos', [StudentController::class, 'index'])->name('students.index');
    Route::post('/alunos', [StudentController::class, 'store'])->name('students.store');
    Route::post('/alunos/{student}/nova-senha', [StudentController::class, 'resetPassword'])->name('students.reset');
    Route::delete('/alunos/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

    // Exams
    Route::get('/provas', [AdminExamController::class, 'index'])->name('exams.index');
    Route::get('/provas/criar', [AdminExamController::class, 'create'])->name('exams.create');
    Route::post('/provas', [AdminExamController::class, 'store'])->name('exams.store');
    Route::get('/provas/{exam}/editar', [AdminExamController::class, 'edit'])->name('exams.edit');
    Route::put('/provas/{exam}', [AdminExamController::class, 'update'])->name('exams.update');
    Route::post('/provas/{exam}/publicar', [AdminExamController::class, 'togglePublish'])->name('exams.publish');
    Route::delete('/provas/{exam}', [AdminExamController::class, 'destroy'])->name('exams.destroy');
    Route::get('/provas/{exam}/resultados', [AdminExamController::class, 'results'])->name('exams.results');
});

require __DIR__.'/auth.php';
