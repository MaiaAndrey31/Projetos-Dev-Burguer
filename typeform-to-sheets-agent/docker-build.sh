#!/bin/bash

# Cores para saída
green='\033[0;32m'
yellow='\033[1;33m'
red='\033[0;31m'
nc='\033[0m' # No Color

# Função para exibir mensagens de sucesso
success() {
  echo -e "${green}[SUCESSO]${nc} $1"
}

# Função para exibir avisos
warning() {
  echo -e "${yellow}[AVISO]${nc} $1"
}

# Função para exibir erros e sair
error() {
  echo -e "${red}[ERRO]${nc} $1"
  exit 1
}

echo -e "${green}========================================${nc}"
echo -e "${green}  Typeform para Google Sheets - Docker  ${nc}"
echo -e "${green}========================================${nc}"

# Verifica se o Docker está instalado
if ! command -v docker &> /dev/null; then
  error "Docker não encontrado. Por favor, instale o Docker e tente novamente."
fi

# Verifica se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
  error "Docker Compose não encontrado. Por favor, instale o Docker Compose e tente novamente."
fi

# Verifica se o arquivo .env existe
if [ ! -f ".env" ]; then
  warning "Arquivo .env não encontrado. Criando a partir do .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    success "Arquivo .env criado com sucesso a partir de .env.example"
    warning "Por favor, configure as variáveis de ambiente no arquivo .env"
    exit 0
  else
    error "Arquivo .env.example não encontrado. Por favor, crie um arquivo .env com as configurações necessárias."
  fi
fi

# Verifica se o arquivo credentials.json existe
if [ ! -f "credentials.json" ]; then
  warning "Arquivo credentials.json não encontrado na raiz do projeto."
  warning "Por favor, adicione o arquivo credentials.json do Google Cloud Platform."
  read -p "Deseja continuar mesmo sem o arquivo de credenciais? (s/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada pelo usuário."
    exit 1
  fi
fi

# Menu de opções
PS3='Selecione uma opção: '
options=(
  "Iniciar a aplicação (produção)" 
  "Iniciar modo desenvolvimento" 
  "Parar a aplicação" 
  "Reconstruir e reiniciar" 
  "Ver logs" 
  "Abrir terminal no contêiner" 
  "Sair"
)

select opt in "${options[@]}"
do
  case $opt in
    "Iniciar a aplicação (produção)")
      echo "Iniciando a aplicação em modo produção..."
      docker-compose up -d --build
      success "Aplicação iniciada em http://localhost:3000"
      ;;
    "Iniciar modo desenvolvimento")
      echo "Iniciando modo desenvolvimento..."
      docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
      success "Modo desenvolvimento iniciado em http://localhost:3001"
      ;;
    "Parar a aplicação")
      echo "Parando a aplicação..."
      docker-compose down
      success "Aplicação parada"
      ;;
    "Reconstruir e reiniciar")
      echo "Reconstruindo e reiniciando a aplicação..."
      docker-compose down
      docker-compose up -d --build
      success "Aplicação reconstruída e reiniciada"
      ;;
    "Ver logs")
      echo "Exibindo logs (pressione Ctrl+C para sair)..."
      docker-compose logs -f
      ;;
    "Abrir terminal no contêiner")
      echo "Abrindo terminal no contêiner..."
      docker-compose exec app sh
      ;;
    "Sair")
      echo "Saindo..."
      break
      ;;
    *) 
      echo "Opção inválida"
      ;;
  esac
done
