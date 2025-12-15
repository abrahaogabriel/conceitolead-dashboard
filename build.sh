#!/bin/bash

# Script para fazer build da imagem com as variáveis de ambiente

# Carrega as variáveis do arquivo .env
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Por favor, crie o arquivo .env com as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Carrega as variáveis
export $(cat .env | grep -v '^#' | xargs)

echo "🔨 Fazendo build da imagem conceitolead_hub:latest..."
echo "📦 VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:30}..."

# Faz o build passando as variáveis como build args
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -t conceitolead_hub:latest \
  .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "Agora execute:"
    echo "  docker stack deploy -c docker-compose.yml conceitolead_hub"
else
    echo "❌ Erro no build!"
    exit 1
fi
