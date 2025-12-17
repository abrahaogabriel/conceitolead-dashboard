# Configuração de Banco de Dados para Módulo de Metas

Rode os comandos abaixo no **SQL Editor** do seu projeto Supabase para preparar o banco de dados.

## 1. Adicionar UTM ao Perfil do Usuário
Para vincularmos a venda ao vendedor, precisamos saber qual é o código UTM dele.

```sql
ALTER TABLE public.profiles 
ADD COLUMN utm_code text;

-- (Opcional) Adicionar índice para busca rápida
CREATE INDEX idx_profiles_utm_code ON public.profiles(utm_code);
```

## 2. Criar Tabela de Metas (Sales Goals)
Esta tabela armazena a meta base (100%) de cada vendedor por mês.

```sql
create table public.sales_goals (
  id uuid not null default extensions.uuid_generate_v4 (),
  salesperson_id uuid not null,
  month integer not null,
  year integer not null,
  target_amount numeric(10, 2) not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  
  -- Chave primária
  constraint sales_goals_pkey primary key (id),
  
  -- Garante que só existe UMA meta por vendedor/mês/ano
  constraint sales_goals_salesperson_id_month_year_key unique (salesperson_id, month, year),
  
  -- Relacionamento com tabela de perfis
  constraint sales_goals_salesperson_id_fkey foreign KEY (salesperson_id) references profiles (id)
) TABLESPACE pg_default;

-- Habilitar RLS (Segurança)
ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;

-- Política: Admin vê tudo
CREATE POLICY "Admins can view all goals" ON public.sales_goals
FOR SELECT USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Política: Admin pode criar/editar metas
CREATE POLICY "Admins can insert/update goals" ON public.sales_goals
FOR ALL USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Política: Vendedor vê apenas suas próprias metas
CREATE POLICY "Salespeople can view own goals" ON public.sales_goals
FOR SELECT USING (
  salesperson_id = auth.uid()
);
```

## 3. Verificar Tabela de Vendas (Sales)
Precisamos garantir que suas vendas tenham onde guardar a UTM. Se você já tem uma coluna como `utm_source`, `utm_campaign` ou apenas `utm_code` na tabela `sales`, ótimo. Se não, adicione:

```sql
-- Apenas rode se ainda NÃO tiver campos de UTM na tabela sales
ALTER TABLE public.sales 
ADD COLUMN utm_code text;
```
