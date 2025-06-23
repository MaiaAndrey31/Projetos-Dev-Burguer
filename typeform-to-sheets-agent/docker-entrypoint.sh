#!/bin/sh
set -e

# Função para exibir mensagens de log
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Verifica se o arquivo .env existe e copia do exemplo se necessário
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  log "Arquivo .env não encontrado. Copiando de .env.example..."
  cp .env.example .env
  log "Arquivo .env criado a partir de .env.example"
fi

# Verifica se o arquivo credentials.json existe
if [ ! -f "credentials.json" ]; then
  log "Aviso: O arquivo credentials.json não foi encontrado."
  log "Certifique-se de que o Google Sheets API está configurado corretamente."
fi

# Executa migrações ou comandos de inicialização, se necessário
# Exemplo: node scripts/migrate.js

# Executa o comando passado para o contêiner
exec "$@"
