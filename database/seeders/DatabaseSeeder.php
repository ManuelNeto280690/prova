<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default administrator.
        $admin = User::updateOrCreate(
            ['email' => 'admin@prova.test'],
            [
                'name' => 'Administrador',
                'role' => User::ROLE_ADMIN,
                'password' => 'password', // hashed via cast — change after first login
                'must_change_password' => false,
                'email_verified_at' => now(),
            ]
        );

        // A demo student.
        User::updateOrCreate(
            ['email' => 'aluno@prova.test'],
            [
                'name' => 'Aluno Demonstração',
                'role' => User::ROLE_STUDENT,
                'password' => 'password',
                'must_change_password' => false,
                'email_verified_at' => now(),
            ]
        );

        // A sample published exam with two questions.
        if (Exam::count() === 0) {
            $exam = Exam::create([
                'title' => 'Avaliação de Conhecimentos Gerais',
                'description' => 'Prova de múltipla escolha com tempo cronometrado.',
                'duration_minutes' => 10,
                'is_published' => true,
                'created_by' => $admin->id,
            ]);

            $q1 = $exam->questions()->create(['statement' => 'Qual é a capital do Brasil?', 'order' => 0]);
            $q1->options()->createMany([
                ['text' => 'São Paulo', 'is_correct' => false, 'order' => 0],
                ['text' => 'Brasília', 'is_correct' => true, 'order' => 1],
                ['text' => 'Rio de Janeiro', 'is_correct' => false, 'order' => 2],
                ['text' => 'Salvador', 'is_correct' => false, 'order' => 3],
            ]);

            $q2 = $exam->questions()->create(['statement' => 'Quanto é 7 × 8?', 'order' => 1]);
            $q2->options()->createMany([
                ['text' => '54', 'is_correct' => false, 'order' => 0],
                ['text' => '56', 'is_correct' => true, 'order' => 1],
                ['text' => '58', 'is_correct' => false, 'order' => 2],
                ['text' => '64', 'is_correct' => false, 'order' => 3],
            ]);
        }
    }
}
