# Comandos para Atualizar e Fazer Rebuild na VPS

## 1. Fazer pull das atualizações

```bash
cd ~/hub-cl/conceitolead_hub
git pull origin main
```

## 2. Verificar/Editar o arquivo .env

Certifique-se de que o arquivo `.env` existe e contém as variáveis corretas:

```bash
cat .env
```

Se precisar editar:

```bash
nano .env
```

O arquivo deve conter:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 3. Remover a stack antiga

```bash
docker stack rm conceitolead_hub
```

Aguarde alguns segundos para que tudo seja removido.

## 4. Remover a imagem antiga (opcional mas recomendado)

```bash
docker rmi conceitolead_hub:latest
```

## 5. Fazer o deploy novamente

```bash
docker stack deploy -c docker-compose.yml conceitolead_hub
```

O Docker irá:
1. Ler o arquivo `.env` 
2. Passar as variáveis como build args para o Dockerfile
3. Fazer o build embedando as variáveis no código JavaScript
4. Criar e iniciar o serviço

## 6. Verificar os logs

```bash
# Aguarde 30 segundos e depois verifique
sleep 30
docker service logs conceitolead_hub_app --tail 50 -f
```

## 7. Acessar a aplicação

Acesse: https://hub.conceitolead.com.br

Agora deve funcionar perfeitamente! 🚀
