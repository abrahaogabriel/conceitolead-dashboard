# 1. Build Stage
FROM node:20-alpine AS build

# Argumentos de build para variáveis de ambiente
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Define as variáveis de ambiente para o build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

WORKDIR /app

# Instala dependências (cache eficiente)
COPY package*.json ./
RUN npm ci

# Copia código fonte e gera o build
COPY . .
RUN npm run build

# 2. Production Stage
FROM nginx:alpine

# Copia configuração otimizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados no build anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
