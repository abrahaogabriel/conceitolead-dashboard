-- Adiciona a coluna de email na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Atualiza os emails dos usuários existentes (opcional, copia da tabela auth.users se possível)
-- Nota: Isso só funciona se tivermos permissão, senão apenas futuros usuários terão email na profiles
-- UPDATE public.profiles p
-- SET email = u.email
-- FROM auth.users u
-- WHERE p.id = u.id;
