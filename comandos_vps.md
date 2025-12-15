# Comandos para executar na VPS agora

## 1. Atualizar o repositório (puxar os arquivos Docker)

```bash
cd ~/hub-cl/conceitolead_hub
git pull origin main
```

## 2. Verificar se os arquivos foram baixados

```bash
ls -la
```

Você deve ver agora:
- Dockerfile
- docker-compose.yml
- nginx.conf
- .dockerignore
- DEPLOY.md

## 3. Configurar as variáveis de ambiente

O arquivo `.env` que você já criou precisa ter as variáveis do Supabase:

```bash
nano .env
```

Adicione:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 4. Build da imagem Docker

```bash
docker build -t conceitolead_hub:latest .
```

## 5. Deploy com Docker Swarm

```bash
docker stack deploy -c docker-compose.yml conceitolead_hub
```

## 6. Verificar o status

```bash
# Ver os serviços
docker stack services conceitolead_hub

# Ver os logs
docker service logs conceitolead_hub_app -f
```

## 7. Acessar a aplicação

Abra no navegador: https://hub.conceitolead.com.br

O Traefik irá gerar o certificado SSL automaticamente!
