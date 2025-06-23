# ============================================
# Estágio de Desenvolvimento
# ============================================
FROM node:20.13.1-alpine3.19 AS development

# Define o diretório de trabalho
WORKDIR /app

# Instala as dependências do sistema
RUN apk --no-cache add curl

# Copia primeiro o package.json
COPY package*.json ./

# Copia o diretório src
COPY src/ ./src/

# Copia outros arquivos necessários
COPY *.js ./


# Instala as dependências
RUN npm install

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]

# ============================================
# Estágio de Construção
# ============================================
FROM node:20.13.1-alpine3.19 AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Copia o .npmrc se existir
RUN if [ -f .npmrc ]; then cp .npmrc .; else echo "Arquivo .npmrc não encontrado, continuando sem ele..."; fi

# Instala as dependências de produção e desenvolvimento
RUN npm ci

# Copia o código-fonte
COPY . .

# Compila o código
RUN npm run build

# Remove as dependências de desenvolvimento
RUN npm prune --production

# ============================================
# Estágio de Produção
# ============================================
FROM node:20.13.1-alpine3.19 AS production

# Define o diretório de trabalho
WORKDIR /app

# Define as variáveis de ambiente
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Instala curl para healthchecks
RUN apk --no-cache add curl

# Cria o usuário e grupo node
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copia apenas os arquivos necessários do estágio de construção
COPY --chown=nodejs:nodejs --from=builder /app/package*.json ./
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Copia os arquivos de configuração (se existirem)
RUN if [ -f /app/credentials.json ]; then cp /app/credentials.json /app/; else echo "Arquivo credentials.json não encontrado, continuando sem ele..."; fi
RUN if [ -f /app/.env ]; then cp /app/.env /app/; else echo "Arquivo .env não encontrado, continuando sem ele..."; fi

# Define as permissões corretas
RUN chmod -R 755 /app && \
    chown -R nodejs:nodejs /app

# Muda para o usuário nodejs
USER nodejs

# Expõe a porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
