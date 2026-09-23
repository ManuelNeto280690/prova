<x-mail::message>
# Olá, {{ $studentName }} 👋

Sua conta de acesso à **Plataforma de Provas** foi criada.

Use as credenciais abaixo para entrar:

- **E-mail:** {{ $email }}
- **Senha temporária:** {{ $password }}

Por segurança, você será solicitado a **definir uma nova senha** no primeiro acesso.

<x-mail::button :url="$loginUrl">
Acessar a plataforma
</x-mail::button>

Se você não esperava este e-mail, ignore-o.

Atenciosamente,<br>
{{ config('app.name') }}
</x-mail::message>
