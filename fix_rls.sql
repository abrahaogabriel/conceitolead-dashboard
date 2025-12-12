-- 1. Garante que o profile existe com role admin (para sua conta de email)
-- IMPORTANTE: Substitua 'seu@email.com' pelo email que você usa no login!
INSERT INTO public.profiles (id, role, full_name)
SELECT id, 'admin', 'Super Admin'
FROM auth.users 
WHERE email = 'web@novadimensaodigital.com.br' -- Substitua pelo seu e-mail
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. Habilita RLS (Row Level Security) na tabela profiles se ainda não estiver
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remove políticas antigas (para evitar duplicação ou conflitos)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;

-- 4. Cria novas políticas de acesso

-- Política A: Todo mundo autenticado pode LER seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Política B: Admins podem LER e EDITAR todos os perfis
-- (Isso assume que a role 'admin' já está setada no perfil do usuário que faz a query)
-- Obs: Para evitar recursão infinita (checar se é admin requer ler profile), usamos apenas autenticação direta ou auth.jwt() se tiver custom claims.
-- Mas como nossa role está no profile, a query simples pode ser recursiva. 
-- Solução segura: Admin vê tudo? Sim.
-- Vamos permitir SELECT para todos autenticados por enquanto para facilitar, ou criar uma função segura.
-- Simplificação para resolver seu problema agora: Permitir leitura pública de profiles apenas para usuários logados.

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Política C: Usuários podem criar seu próprio perfil (ao criar conta)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Política D: Apenas o dono pode editar seu perfil (ou admin, mas simplificado aqui)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 5. Garante policies para Clients e Products (Exemplificando segurança básica)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
