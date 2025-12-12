-- 1. Verificar se o registro existe na tabela profiles
SELECT p.*, u.email 
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'web@novadimensaodigital.com.br';

-- 2. Se não aparecer nada acima, vamos criar manualmente com o ID correto
-- Primeiro, pegue o ID do usuário:
SELECT id FROM auth.users WHERE email = 'web@novadimensaodigital.com.br';

-- 3. Depois use o ID retornado acima para inserir (SUBSTITUA 'SEU-ID-AQUI' pelo ID real):
-- INSERT INTO public.profiles (id, full_name, role, created_at)
-- VALUES ('SEU-ID-AQUI', 'Super Admin', 'admin', NOW());
