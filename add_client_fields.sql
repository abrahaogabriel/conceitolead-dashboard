-- Adicionar campos de comissão e fee mensal na tabela clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2);

-- Verificar se deu certo
SELECT * FROM public.clients LIMIT 5;
