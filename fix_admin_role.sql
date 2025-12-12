-- 1. Verifica se a tabela profiles existe e se o usuário está lá
select * from public.profiles;

-- 2. Se a tabela não existir, crie-a (Execute este bloco se necessário)
/*
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text check (role in ('admin', 'sales', 'client')) default 'sales',
  client_id text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
*/

-- 3. FORÇAR PERFIL ADMIN (Substitua SEU_EMAIL_AQUI pelo email que você usou no login)
-- Exemplo:
-- update public.profiles set role = 'admin' where id in (select id from auth.users where email = 'admin@admin.com');

-- Se o usuário sequer existir na tabela profiles (caso o trigger tenha falhado ou não exista), insira manualmente:
-- insert into public.profiles (id, role, full_name)
-- select id, 'admin', 'Admin User'
-- from auth.users where email = 'SEU_EMAIL_AQUI'
-- on conflict (id) do update set role = 'admin';
