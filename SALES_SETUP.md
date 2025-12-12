# 📋 Instruções de Configuração do Supabase

## Execute este SQL no Supabase SQL Editor:

```sql
-- Adicionar campos de origem e plataforma na tabela sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS sales_platform TEXT;

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sales' 
ORDER BY ordinal_position;
```

## Campos Adicionados:

1. **lead_source** (text): Origem do lead (ex: Google Ads, Facebook, Indicação)
2. **utm_source** (text): Parâmetro UTM de rastreamento
3. **sales_platform** (text): Plataforma de vendas (Hotmart, Eduzz, Monetizze, Kiwify, etc)

## Mudanças no Código:

✅ Interface `Sale` atualizada em `src/types/index.ts`
✅ Página `Sales.tsx` criada com:
   - Tabela completa de vendas
   - Modal de criação com todos os campos
   - Modal de edição
   - Integração com Supabase
✅ Rota `/sales` atualizada em `App.tsx`

Após executar o SQL, a página de vendas estará 100% funcional! 🚀
