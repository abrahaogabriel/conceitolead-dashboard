-- Remove a coluna de preço da tabela de produtos
ALTER TABLE public.products 
DROP COLUMN IF EXISTS price;
