# Deploy em Produção - hub.conceitolead.com.br

## Pré-requisitos na VPS

1. **Docker** e **Docker Compose** instalados
2. **Traefik** configurado e rodando na rede `nddNet`
3. **Domínio** `hub.conceitolead.com.br` apontando para o IP da VPS
4. **Git** instalado

## Passos para Deploy

### 1. Clonar o Repositório na VPS

```bash
cd /opt  # ou outro diretório de sua preferência
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git conceitolead_hub
cd conceitolead_hub
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (não será incluído no build Docker):

```bash
cp .env.example .env
nano .env
```

**Importante:** As variáveis de ambiente do Supabase devem estar corretas no arquivo `.env` durante o build, pois o Vite as embute no código JavaScript durante a compilação.

### 3. Build e Deploy com Docker Swarm

Se você estiver usando Docker Swarm (como sugere o docker-compose.yml):

```bash
# Fazer o build da imagem
docker build -t conceitolead_hub:latest .

# Deploy da stack
docker stack deploy -c docker-compose.yml conceitolead_hub
```

### 4. Verificar o Deploy

```bash
# Lista os serviços da stack
docker stack services conceitolead_hub

# Logs do serviço
docker service logs conceitolead_hub_app -f
```

### 5. Acessar a Aplicação

Após o deploy, acesse: `https://hub.conceitolead.com.br`

O Traefik irá:
- Gerar automaticamente o certificado SSL via Let's Encrypt
- Redirecionar HTTP para HTTPS
- Fazer o proxy reverso para o container

## Atualizações

Para atualizar a aplicação:

```bash
# Na VPS
cd /opt/conceitolead_hub
git pull origin main  # ou a branch principal

# Rebuild e redeploy
docker build -t conceitolead_hub:latest .
docker stack deploy -c docker-compose.yml conceitolead_hub
```

## Troubleshooting

### Container não inicia
```bash
docker service logs conceitolead_hub_app -f
```

### Problemas com SSL
- Certifique-se de que o domínio está apontando corretamente
- Verifique se o Traefik está configurado com Let's Encrypt
- Aguarde alguns minutos para a geração do certificado

### Aplicação retorna 404
- Verifique se o nginx.conf está correto
- Verifique se o build do Vite gerou os arquivos em `/app/dist`

### Variáveis de ambiente não funcionam
- Lembre-se: no Vite, as variáveis são embedadas no build
- Você precisa fazer rebuild da imagem após alterar o .env
- Use `VITE_` como prefixo nas variáveis que quer expor ao frontend

## Arquitetura

```
Internet → Traefik (SSL/HTTPS) → Container Nginx → App React (SPA)
```

- **Traefik**: Gerencia SSL, certificados e roteamento
- **Nginx**: Serve arquivos estáticos com compressão e cache
- **React App**: Frontend compilado (SPA)
