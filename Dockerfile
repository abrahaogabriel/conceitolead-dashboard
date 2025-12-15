# 1. Build Stage
FROM node:20-alpine AS build

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
