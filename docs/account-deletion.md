# Exclusão de conta

O botão de perfil chama a Edge Function `delete-account`. A função valida o JWT
do usuário, remove somente o seu próprio registro de `auth.users` e nunca expõe a
`SUPABASE_SERVICE_ROLE_KEY` ao navegador. As chaves estrangeiras com `on delete
cascade` removem o perfil, quizzes, tentativas, respostas e perguntas relacionados.

Faça o deploy depois de vincular o projeto Supabase:

```powershell
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy delete-account
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidas
automaticamente no ambiente hospedado da Edge Function. Não cadastre a service-role
key em `VITE_*` nem em qualquer outro arquivo do frontend.
