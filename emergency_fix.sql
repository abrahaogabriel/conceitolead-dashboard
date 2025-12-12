-- PASSO 1: Insere ou atualiza o seu perfil Admin vinculado ao seu email correto
INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Super Admin', 'admin'
FROM auth.users
WHERE email = 'web@novadimensaodigital.com.br'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- PASSO 2: Garante que o RLS (Segurança) permita a leitura
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Cria uma política simples e permissiva para usuários logados
CREATE POLICY "Emergency Read Policy"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- PASSO 3: Verifica se deu certo (O resultado deve mostrar 1 linha com seu ID e role 'admin')
SELECT * FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'web@novadimensaodigital.com.br');
