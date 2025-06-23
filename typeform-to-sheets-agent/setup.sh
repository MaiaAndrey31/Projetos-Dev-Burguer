#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando a configuração do projeto...${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js (v14 ou superior) e tente novamente.${NC}"
    echo -e "📥 Baixe em: ${GREEN}https://nodejs.org/${NC}"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$MAJOR_VERSION" -lt 14 ]; then
    echo -e "${RED}❌ Versão do Node.js ($NODE_VERSION) não suportada. Por favor, atualize para a versão 14 ou superior.${NC}"
    exit 1
fi

echo -e "✅ Node.js $NODE_VERSION detectado"

# Instalar dependências
echo -e "\n${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}📄 Criando arquivo .env a partir do exemplo...${NC}"
    cp .env.example .env
    echo -e "✅ Arquivo .env criado com sucesso"
    echo -e "ℹ️ Por favor, edite o arquivo .env com suas credenciais"
else
    echo -e "\n✅ Arquivo .env já existe"
fi

# Verificar se o arquivo credentials.json existe
if [ ! -f "credentials.json" ]; then
    echo -e "\n${YELLOW}🔑 Arquivo credentials.json não encontrado${NC}"
    echo -e "Por favor, siga as instruções abaixo para configurar as credenciais do Google:"
    echo -e "1. Acesse ${GREEN}https://console.cloud.google.com/${NC}"
    echo -e "2. Crie um novo projeto ou selecione um existente"
    echo -e "3. Ative a API do Google Sheets"
    echo -e "4. Crie uma conta de serviço e baixe o arquivo JSON"
    echo -e "5. Renomeie o arquivo baixado para ${GREEN}credentials.json${NC} e coloque na raiz do projeto"
    echo -e "6. Compartilhe sua planilha com o e-mail da conta de serviço"
else
    echo -e "\n✅ Arquivo credentials.json encontrado"
fi

# Configurar permissões para o script setup.sh
chmod +x setup.sh

# Instalar o ngrok (opcional)
if ! command -v ngrok &> /dev/null; then
    echo -e "\n${YELLOW}ℹ️ Ngrok não encontrado. Deseja instalar? (s/n)${NC}"
    read -p "> " INSTALL_NGROK
    
    if [[ $INSTALL_NGROK =~ ^[Ss]([Ii][Mm])?$ ]]; then
        echo -e "\n${YELLOW}📥 Instalando ngrok...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install --cask ngrok
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
            echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
            sudo apt update && sudo apt install ngrok
        else
            echo -e "${RED}❌ Sistema operacional não suportado para instalação automática do ngrok.${NC}"
            echo -e "📥 Baixe em: ${GREEN}https://ngrok.com/download${NC}"
        fi
    fi
else
    echo -e "\n✅ Ngrok já está instalado"
fi

# Mensagem final
echo -e "\n${GREEN}✨ Configuração concluída com sucesso! ✨${NC}"
echo -e "\nPróximos passos:"
echo -e "1. Edite o arquivo ${GREEN}.env${NC} com suas credenciais"
echo -e "2. Execute ${GREEN}npm run setup-sheet${NC} para configurar a planilha"
echo -e "3. Inicie o servidor com ${GREEN}npm start${NC}"
echo -e "4. (Opcional) Use ${GREEN}ngrok http 3000${NC} para testar localmente"
echo -e "\nPara testar o webhook: ${GREEN}npm run test-webhook${NC}"

# Instalar dependências de desenvolvimento (opcional)
echo -e "\n${YELLOW}Deseja instalar dependências de desenvolvimento? (s/n)${NC}"
read -p "> " INSTALL_DEV

if [[ $INSTALL_DEV =~ ^[Ss]([Ii][Mm])?$ ]]; then
    echo -e "\n${YELLOW}📦 Instalando dependências de desenvolvimento...${NC}"
    npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier nodemon
    
    # Configurar ESLint
    npx eslint --init
    
    echo -e "\n${GREEN}✅ Dependências de desenvolvimento instaladas!${NC}"
    echo -e "Você pode usar os seguintes comandos:"
    echo -e "- ${GREEN}npm run lint${NC} para verificar a qualidade do código"
    echo -e "- ${GREEN}npm run format${NC} para formatar o código"
    echo -e "- ${GREEN}npm run dev${NC} para desenvolvimento com recarregamento automático"
fi

echo -e "\n${GREEN}🚀 Tudo pronto! Agora você pode começar a desenvolver.${NC}"
