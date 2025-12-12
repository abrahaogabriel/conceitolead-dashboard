# Guia de Configuração da Edge Function

## Pré-requisitos
1. Instalar Supabase CLI: https://supabase.com/docs/guides/cli
2. Fazer login no Supabase CLI: `supabase login`

## Passos para Deploy

### 1. Linkar seu projeto
```bash
cd c:\Users\Web 2\OneDrive\Desktop\hub-cl\conceitolead_dashboard
supabase link --project-ref SEU_PROJECT_REF
```

**Como encontrar o PROJECT_REF:**
- Vá em: https://supabase.com/dashboard/project/SEU_PROJETO/settings/general
- Copie o "Reference ID"

### 2. Deploy da função
```bash
supabase functions deploy create-user
```

### 3. Configurar variáveis de ambiente (IMPORTANTE!)
No painel do Supabase:
1. Vá em: **Settings** → **Edge Functions**
2. Adicione as seguintes variáveis:
   - `SUPABASE_URL`: Sua URL do Supabase (já configurada automaticamente)
   - `SUPABASE_ANON_KEY`: Sua chave anônima (já configurada automaticamente)
   - `SUPABASE_SERVICE_ROLE_KEY`: **Você precisa adicionar esta!**
     - Encontre em: Settings → API → service_role key (secret)

### 4. Testar a função
Após o deploy, a URL será algo como:
```
https://SEU_PROJECT_REF.supabase.co/functions/v1/create-user
```

### 5. Atualizar o código do frontend
Depois do deploy, atualize o arquivo `CreateUserModal` para chamar a Edge Function ao invés de mostrar a mensagem informativa.

## Estrutura da Requisição
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha_segura",
  "full_name": "Nome Completo",
  "role": "sales",
  "client_id": "uuid-do-cliente" // opcional
}
```

## Troubleshooting

### Erro: "Missing SUPABASE_SERVICE_ROLE_KEY"
- Certifique-se de adicionar a service_role key nas variáveis de ambiente da Edge Function

### Erro: "Forbidden"
- Verifique se o usuário logado tem role 'admin' na tabela profiles

### Erro de CORS
- A função já está configurada para aceitar requisições do frontend

## Próximos Passos
Após configurar a Edge Function, me avise que eu atualizo o código do frontend para usá-la!
