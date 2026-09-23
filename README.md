# ProvaSegura — Plataforma de Provas Online

Portal de avaliação online construído com **Laravel 12 + Inertia + React + Tailwind CSS**,
com foco em **segurança**, tempo cronometrado e integridade das provas.

## Recursos

- **Área administrativa isolada** — protegida por middleware `admin`. Um aluno que tente
  acessar `/admin` recebe **403**.
- **Cadastro de alunos** (nome + e-mail). O sistema **gera uma senha forte automaticamente**,
  exibe uma única vez ao admin (para repasse) e envia por e-mail quando o SMTP estiver configurado.
- **Troca de senha obrigatória no primeiro acesso** do aluno.
- **Provas de múltipla escolha** (estilo americano) com construtor visual de questões/alternativas.
- **Tempo definido pelo admin** por prova. O cronômetro é **validado no servidor** — não é possível
  burlar mexendo no relógio do navegador.
- **Tentativa única**: ao concluir (ou ao esgotar o tempo) a prova é travada e não pode ser refeita.
- **Encerramento automático por tempo**: ao zerar o cronômetro, as respostas são enviadas,
  o aluno é alertado e **deslogado** automaticamente.
- **Aviso de tempo baixo** (último minuto) com destaque visual.
- **Resultados no admin**: lista de alunos, notas, acertos e status por prova.
- Interface **premium** (dark, glassmorphism) com animações via **Framer Motion**.

## Requisitos

- PHP 8.2+, Composer, Node 18+ e npm.

## Como rodar (desenvolvimento)

Instale as dependências (só na primeira vez):

```bash
composer install
npm install
```

Prepare o banco (SQLite, já configurado) e os dados iniciais:

```bash
php artisan migrate:fresh --seed
```

Suba os dois processos (em terminais separados):

```bash
php artisan serve
```

```bash
npm run dev
```

Acesse **http://127.0.0.1:8000**.

> Para um único comando com tudo junto (server + vite + queue), você também pode usar:
> ```bash
> composer run dev
> ```

## Acessos de demonstração (criados pelo seeder)

| Papel  | E-mail             | Senha      |
|--------|--------------------|------------|
| Admin  | admin@prova.test   | `password` |
| Aluno  | aluno@prova.test   | `password` |

O seeder também cria uma prova publicada de exemplo.

## Fluxo de uso

**Admin**
1. Login → **Painel** (visão geral).
2. **Alunos** → cadastrar aluno → copiar a senha gerada e repassar.
3. **Provas** → *Nova prova* → definir título, **tempo (min)**, questões/alternativas e a correta → publicar.
4. **Resultados** de cada prova para ver o desempenho.

**Aluno**
1. Login (troca a senha no primeiro acesso).
2. **Minhas provas** → *Começar prova* (o cronômetro inicia).
3. Responde todas → *Finalizar e enviar*. Se o tempo acabar antes, a prova é encerrada
   e enviada automaticamente e a sessão é encerrada.

## Notas de segurança

- Senhas com hash (bcrypt), CSRF em todas as requisições (Inertia/axios).
- As **respostas corretas nunca são enviadas ao navegador** durante a prova.
- O prazo é calculado a partir de `started_at` no servidor; recarregar a página **não** reinicia o tempo.
- Registro público desabilitado — contas só são criadas pelo admin.
- Regra de tentativa única garantida por índice único `(user_id, exam_id)` no banco.

## E-mail (opcional)

Por padrão `MAIL_MAILER=log` (as mensagens vão para `storage/logs/laravel.log`).
Para enviar de verdade, configure SMTP no `.env` (`MAIL_MAILER=smtp`, host, porta, usuário, senha).

## Principais arquivos

- Migrations/domínio: `database/migrations/2026_09_23_*`
- Models: `app/Models/{Exam,Question,Option,Attempt,Answer,User}.php`
- Segurança: `app/Http/Middleware/{EnsureUserIsAdmin,EnsurePasswordChanged}.php`
- Lógica da prova (timer/correção): `app/Http/Controllers/Student/ExamController.php`
- Admin: `app/Http/Controllers/Admin/*`
- Rotas: `routes/web.php`
- Telas React: `resources/js/Pages/**`
