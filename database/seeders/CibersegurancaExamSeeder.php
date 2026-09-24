<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CibersegurancaExamSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', User::ROLE_ADMIN)->first() ?? User::first();

        DB::transaction(function () use ($admin) {
            // Find existing exam with same title or create new
            $exam = Exam::updateOrCreate(
                ['title' => 'Cibersegurança no Ambiente Institucional'],
                [
                    'description' => 'Seminário de Sensibilização em Cibersegurança — Formador: Manuel Neto',
                    'duration_minutes' => 30,
                    'is_published' => true,
                    'is_active' => false, // Will be activated live by the teacher
                    'activated_at' => null,
                    'created_by' => $admin?->id,
                ]
            );

            // Clear previous questions if re-seeding
            $exam->questions()->delete();

            $questionsData = [
                [
                    'statement' => '1. Qual dos pilares da segurança da informação garante que a informação só pode ser consultada por pessoas autorizadas?',
                    'options' => [
                        ['text' => 'Disponibilidade', 'is_correct' => false],
                        ['text' => 'Confidencialidade', 'is_correct' => true], // B
                        ['text' => 'Integridade', 'is_correct' => false],
                        ['text' => 'Autenticidade', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => "2. Cenário: Um funcionário descobre que os valores de vários registos na base de dados de cidadãos foram alterados por alguém sem autorização. Nenhum dado foi copiado e o sistema continua a funcionar normalmente.\n\nQue pilar da segurança da informação foi principalmente afectado?",
                    'options' => [
                        ['text' => 'Disponibilidade, porque o sistema pode deixar de funcionar', 'is_correct' => false],
                        ['text' => 'Confidencialidade, porque alguém acedeu ao sistema', 'is_correct' => false],
                        ['text' => 'Integridade, porque a informação foi alterada sem autorização', 'is_correct' => true], // C
                        ['text' => 'Nenhum, porque não houve roubo de dados', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => '3. Como se designa a técnica de engenharia social realizada através de chamadas de voz, em que o atacante se faz passar por uma pessoa ou entidade legítima?',
                    'options' => [
                        ['text' => 'Vishing', 'is_correct' => true], // A
                        ['text' => 'Smishing', 'is_correct' => false],
                        ['text' => 'Baiting', 'is_correct' => false],
                        ['text' => 'Dumpster Diving', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => "4. Cenário: Ao chegar ao escritório, encontra no corredor uma pen drive com a etiqueta \"Salários 2026\". Fica curioso sobre o conteúdo.\n\nQual é a melhor atitude?",
                    'options' => [
                        ['text' => 'Ligá-la ao computador institucional, porque o antivírus irá proteger o equipamento', 'is_correct' => false],
                        ['text' => 'Ligá-la ao seu computador pessoal em casa para verificar o conteúdo com segurança', 'is_correct' => false],
                        ['text' => 'Guardá-la na gaveta e esperar que alguém a reclame', 'is_correct' => false],
                        ['text' => 'Não a ligar a nenhum equipamento e entregá-la à equipa de TI/Cibersegurança', 'is_correct' => true], // D
                    ],
                ],
                [
                    'statement' => '5. Qual é a principal característica do ataque de Whaling?',
                    'options' => [
                        ['text' => 'É um ataque genérico enviado ao maior número possível de pessoas', 'is_correct' => false],
                        ['text' => 'É dirigido especificamente a altos responsáveis, como directores ou administradores', 'is_correct' => true], // B
                        ['text' => 'É realizado exclusivamente através de SMS', 'is_correct' => false],
                        ['text' => 'Consiste em procurar informação em documentos descartados no lixo', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => "6. Cenário: Está numa reunião e recebe no telemóvel uma notificação de autenticação multifactor (MFA) para aprovar um início de sessão na sua conta institucional. Não estava a tentar iniciar sessão.\n\nQual é a melhor atitude?",
                    'options' => [
                        ['text' => 'Recusar o pedido e comunicar imediatamente a situação à equipa de TI/Cibersegurança', 'is_correct' => true], // A
                        ['text' => 'Aprovar o pedido, porque pode ser uma actualização automática do sistema', 'is_correct' => false],
                        ['text' => 'Ignorar a notificação, já que nada mais aconteceu', 'is_correct' => false],
                        ['text' => 'Aprovar e depois alterar a palavra-passe por conta própria', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => "7. Cenário: Recebe um e-mail bem redigido, aparentemente enviado pelo Director, com a mensagem: \"Estou numa reunião e preciso que trate deste pagamento com urgência. Envio os dados bancários em anexo.\"\n\nQual é a melhor atitude?",
                    'options' => [
                        ['text' => 'Efectuar o pagamento de imediato, porque o pedido vem de um superior', 'is_correct' => false],
                        ['text' => 'Responder ao e-mail a perguntar se o pedido é verdadeiro', 'is_correct' => false],
                        ['text' => 'Confirmar o pedido junto do Director através de outro canal oficial e seguir o procedimento institucional', 'is_correct' => true], // C
                        ['text' => 'Reencaminhar o e-mail para todos os colegas a alertar sobre o pedido', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => '8. Na autenticação multifactor, qual dos seguintes exemplos corresponde ao factor "algo que possui"?',
                    'options' => [
                        ['text' => 'Palavra-passe', 'is_correct' => false],
                        ['text' => 'PIN', 'is_correct' => false],
                        ['text' => 'Impressão digital', 'is_correct' => false],
                        ['text' => 'Telemóvel ou token de segurança', 'is_correct' => true], // D
                    ],
                ],
                [
                    'statement' => "9. Cenário: Um colega precisa de preparar rapidamente um resumo de um contrato confidencial da instituição e pretende copiar o documento completo para uma ferramenta pública de Inteligência Artificial.\n\nQual é a melhor orientação a dar-lhe?",
                    'options' => [
                        ['text' => 'Pode avançar, desde que verifique depois se o resumo está correcto', 'is_correct' => false],
                        ['text' => 'Não deve inserir o contrato sem autorização, porque a informação seria enviada para um serviço externo', 'is_correct' => true], // B
                        ['text' => 'Pode avançar, desde que apague a conversa com a IA no final', 'is_correct' => false],
                        ['text' => 'Deve usar a sua conta pessoal da ferramenta para não comprometer a conta institucional', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => "10. Cenário: Clicou num link de um e-mail e introduziu as suas credenciais numa página que, logo a seguir, percebeu ser falsa.\n\nQual é a melhor atitude?",
                    'options' => [
                        ['text' => 'Apagar o e-mail para evitar que outros colegas o abram', 'is_correct' => false],
                        ['text' => 'Continuar a trabalhar normalmente e esperar para ver se algo acontece', 'is_correct' => false],
                        ['text' => 'Parar, preservar o e-mail recebido e comunicar imediatamente ao responsável pelo canal oficial', 'is_correct' => true], // C
                        ['text' => 'Instalar um programa de limpeza da Internet para verificar o computador', 'is_correct' => false],
                    ],
                ],
                [
                    'statement' => '11. Durante um incidente de segurança, qual das seguintes acções NÃO deve ser realizada pelo colaborador?',
                    'options' => [
                        ['text' => 'Anotar a data e hora aproximadas do ocorrido', 'is_correct' => false],
                        ['text' => 'Comunicar a situação ao responsável definido pela instituição', 'is_correct' => false],
                        ['text' => 'Seguir as instruções da equipa de TI/Cibersegurança', 'is_correct' => false],
                        ['text' => 'Formatar o equipamento por iniciativa própria para eliminar a ameaça', 'is_correct' => true], // D
                    ],
                ],
                [
                    'statement' => "12. Cenário: Precisa de partilhar uma pasta com documentos internos com três colegas de outro departamento que participam num projecto.\n\nQual é a melhor forma de o fazer?",
                    'options' => [
                        ['text' => 'Partilhar a pasta na plataforma institucional apenas com os utilizadores autorizados', 'is_correct' => true], // A
                        ['text' => 'Criar um link público e enviá-lo por WhatsApp aos colegas', 'is_correct' => false],
                        ['text' => 'Enviar os documentos a partir do seu e-mail pessoal, por ser mais rápido', 'is_correct' => false],
                        ['text' => 'Carregar os documentos numa aplicação gratuita de partilha e enviar o link', 'is_correct' => false],
                    ],
                ],
            ];

            foreach ($questionsData as $qIndex => $qData) {
                $question = Question::create([
                    'exam_id' => $exam->id,
                    'statement' => $qData['statement'],
                    'order' => $qIndex,
                ]);

                foreach ($qData['options'] as $oIndex => $oData) {
                    Option::create([
                        'question_id' => $question->id,
                        'text' => $oData['text'],
                        'is_correct' => $oData['is_correct'],
                        'order' => $oIndex,
                    ]);
                }
            }
        });
    }
}
