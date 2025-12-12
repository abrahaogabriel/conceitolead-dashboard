-- Criar tabela de logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT, -- 'user', 'client', 'product', etc
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- Desabilitar RLS para facilitar (ou criar policy permissiva)
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT * FROM public.activity_logs LIMIT 5;
