# Integração Typeform para Google Sheets com Notificações WhatsApp

Automatize o processo de coleta de respostas do Typeform, armazenando-as no Google Sheets e enviando notificações por WhatsApp.

## Funcionalidades

- 🚀 Coleta automática de respostas do Typeform
- 📊 Armazenamento em planilhas do Google Sheets
- 💬 Envio de notificações por WhatsApp para novos envios
- 🤖 Processamento de dados com IA (OpenAI) para formatação de nomes
- 🔒 Tratamento seguro de dados sensíveis
- 📊 Logs detalhados para depuração
- 🐳 Suporte a Docker para implantação fácil
- 🏥 Endpoint de verificação de saúde da aplicação

## Pré-requisitos

1. Node.js (v14 ou superior)
2. npm ou yarn
3. Conta no Google Cloud Platform
4. Conta no Typeform
5. Conta no UltraMsg (para notificações WhatsApp)
6. (Opcional) Chave da API OpenAI para processamento de IA

## Configuração Inicial

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/typeform-to-sheets-agent.git
   cd typeform-to-sheets-agent
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias (veja a seção de configuração abaixo)

4. **Configure as credenciais do Google**
   - Baixe o arquivo `credentials.json` do Google Cloud Console
   - Coloque o arquivo na raiz do projeto

## Configuração do Ambiente

### 1. Google Cloud Platform
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sheets
4. Crie uma conta de serviço e baixe o arquivo JSON de credenciais
5. Compartilhe sua planilha do Google com o e-mail da conta de serviço

### 2. Typeform
1. Acesse seu formulário no Typeform
2. Vá em "Conectar" > "Webhooks"
3. Adicione um novo webhook com a URL: `https://seu-dominio.com/webhook`
4. (Opcional) Adicione um segredo de webhook para segurança

### 3. WhatsApp (Opcional)
1. Crie uma conta no [UltraMsg](https://ultramsg.com/)
2. Obtenha sua chave de API e ID da instância
3. Adicione essas informações no arquivo `.env`

### 4. OpenAI (Opcional)
1. Acesse [OpenAI API](https://platform.openai.com/)
2. Crie uma chave de API
3. Adicione a chave no arquivo `.env`

## Executando a Aplicação

### Modo Desenvolvimento

1. **Inicie o servidor**
   ```bash
   npm start
   ```
   Isso iniciará o servidor em `http://localhost:3000`

2. **Teste o endpoint de saúde**
   ```
   GET http://localhost:3000/health
   ```
   Deve retornar o status dos serviços configurados

### Usando Docker

1. **Construa a imagem**
   ```bash
   docker build -t typeform-agent .
   ```

2. **Execute o contêiner**
   ```bash
   docker run -d --name typeform-agent -p 3000:3000 --env-file .env typeform-agent
   ```

### Configurando o Webhook no Typeform

1. **Para desenvolvimento local** (usando ngrok):
   ```bash
   ngrok http 3000
   ```
   Use a URL fornecida pelo ngrok (ex: `https://abc123.ngrok.io`)

2. No Typeform:
   - Acesse seu formulário
   - Vá em "Conectar" > "Webhooks"
   - Adicione um novo webhook com a URL: `https://sua-url-ngrok.ngrok.io/webhook`
   - Defina o método como POST
   - (Opcional) Adicione um segredo de webhook

### Verificando Logs

A aplicação gera logs detalhados que podem ser úteis para depuração:

```
# Logs de requisições
[2023-06-23T14:30:00.000Z] POST /webhook
[2023-06-23T14:30:00.100Z] POST /webhook - 200 (100ms)

# Logs de processamento
Processando endereço: { ... }
Endereço processado: { endereco: '...', cidade: '...', estado: '...', cep: '...' }
Dados salvos com sucesso no Google Sheets
Notificação por WhatsApp enviada com sucesso
```

## Estrutura do Projeto

```
typeform-to-sheets-agent/
├── src/
│   └── index.js          # Ponto de entrada da aplicação
├── .env                  # Variáveis de ambiente (não versionado)
├── .env.example         # Exemplo de variáveis de ambiente
├── credentials.json      # Credenciais do Google (não versionado)
├── package.json         # Dependências e scripts
├── README.md            # Esta documentação
└── setup-sheet.js       # Script para configurar a planilha
```

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `PORT` | Não | Porta do servidor (padrão: 3000) |
| `GOOGLE_SHEET_ID` | Sim | ID da planilha do Google Sheets |
| `WHATSAPP_API_KEY` | Não | Chave da API do UltraMsg |
| `WHATSAPP_INSTANCE_ID` | Não | ID da instância do UltraMsg |
| `OPENAI_API_KEY` | Não | Chave da API da OpenAI |
| `TYPEFORM_WEBHOOK_SECRET` | Não | Segredo para validação do webhook |
| `NODE_ENV` | Não | Ambiente de execução (development/production) |
| `LOG_LEVEL` | Não | Nível de log (error, warn, info, debug) |

## Solução de Problemas

### Erros comuns

1. **Erro de autenticação do Google**
   - Verifique se o arquivo `credentials.json` está no local correto
   - Confirme se a conta de serviço tem permissão na planilha

2. **Webhook não está sendo acionado**
   - Verifique se a URL do webhook está correta
   - Confira os logs do servidor para ver se a requisição está chegando

3. **Erro ao salvar no Google Sheets**
   - Verifique se a planilha existe e está acessível
   - Confira se o ID da planilha está correto

### Depuração

Ative logs detalhados definindo:
```bash
export LOG_LEVEL=debug
npm start
```

## Segurança

- **Nunca compartilhe** seu arquivo `credentials.json` ou chaves de API
- Use HTTPS em produção
- Ative a validação de webhook do Typeform para segurança adicional
- Mantenha as dependências atualizadas

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ para a comunidade DevClub
