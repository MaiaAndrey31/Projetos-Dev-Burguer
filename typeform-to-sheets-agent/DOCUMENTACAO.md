# Documentação do Projeto

## Visão Geral

Este projeto é uma integração entre Typeform, Google Sheets e WhatsApp que permite:

1. Coletar respostas de formulários do Typeform
2. Armazenar os dados em uma planilha do Google Sheets
3. Enviar notificações por WhatsApp para os respondentes
4. Validar e formatar dados usando IA (OpenAI)

## Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│             │     │             │     │                 │     │                 │
│  Typeform   ├────►│  Servidor   ├────►│  Google Sheets  │     │     OpenAI      │
│  (Webhook)  │     │   Node.js   │     │                 │     │  (Opcional)    │
│             │     │             │     │                 │     │                 │
└─────────────┘     └──────┬──────┘     └─────────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │             │
                    │  WhatsApp   │
                    │  (UltraMsg) │
                    │             │
                    └─────────────┘
```

## Fluxo de Dados

1. O usuário preenche o formulário no Typeform
2. O Typeform envia os dados para nosso webhook
3. O servidor processa e valida os dados
4. Os dados são salvos no Google Sheets
5. Uma notificação é enviada por WhatsApp (opcional)
6. O usuário recebe confirmação

## Estrutura do Código

- `src/index.js` - Ponto de entrada da aplicação, configuração do servidor e rotas
- `setup-sheet.js` - Script para configurar a planilha do Google Sheets
- `test-webhook.js` - Ferramenta para testar o webhook localmente
- `.env` - Variáveis de ambiente (não versionado)
- `credentials.json` - Credenciais do Google Cloud (não versionado)

## Endpoints da API

### `POST /webhook`
- Recebe os dados do Typeform
- Processa e armazena as respostas
- Envia notificação por WhatsApp

### `GET /health`
- Verifica a saúde da aplicação
- Retorna o status dos serviços integrados

## Configuração do Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example` com as seguintes variáveis:

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Google Sheets
GOOGLE_SHEET_ID=sua_planilha_id

# WhatsApp (Opcional)
WHATSAPP_API_KEY=sua_chave
WHATSAPP_INSTANCE_ID=sua_instancia

# OpenAI (Opcional)
OPENAI_API_KEY=sua_chave
OPENAI_MODEL=gpt-3.5-turbo

# Segurança
TYPEFORM_WEBHOOK_SECRET=seu_segredo
```

### Google Cloud Platform

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Sheets
4. Crie uma conta de serviço
5. Baixe o arquivo JSON de credenciais
6. Renomeie para `credentials.json` e coloque na raiz do projeto
7. Compartilhe sua planilha com o e-mail da conta de serviço

## Testando a Aplicação

### Localmente

1. Inicie o servidor:
   ```bash
   npm start
   ```

2. Em outro terminal, inicie o ngrok:
   ```bash
   ngrok http 3000
   ```

3. Configure o webhook do Typeform para apontar para a URL do ngrok + `/webhook`

4. Teste o webhook:
   ```bash
   npm run test-webhook
   ```

### Com Docker

1. Construa a imagem:
   ```bash
   docker build -t typeform-agent .
   ```

2. Execute o contêiner:
   ```bash
   docker run -d --name typeform-agent -p 3000:3000 --env-file .env typeform-agent
   ```

## Monitoramento e Logs

A aplicação gera logs detalhados que podem ser usados para monitoramento e depuração:

```
[2023-06-23T14:30:00.000Z] POST /webhook
[2023-06-23T14:30:00.100Z] POST /webhook - 200 (100ms)
Processando endereço: {...}
Dados salvos com sucesso no Google Sheets
```

### Níveis de Log

- `error`: Erros críticos que impedem o funcionamento
- `warn`: Avisos sobre problemas não críticos
- `info`: Informações gerais sobre o fluxo da aplicação
- `debug`: Informações detalhadas para depuração

## Segurança

### Recomendações

1. **Nunca compartilhe** seu arquivo `credentials.json`
2. Use HTTPS em produção
3. Ative a validação de webhook do Typeform
4. Mantenha as dependências atualizadas
5. Use variáveis de ambiente para dados sensíveis

### Validação de Webhook

Para habilitar a validação de webhook, defina a variável `TYPEFORM_WEBHOOK_SECRET` no arquivo `.env`. O servidor validará a assinatura de todas as requisições recebidas.

## Manutenção

### Atualizando Dependências

Para manter o projeto seguro e estável, atualize regularmente as dependências:

```bash
npm outdated
npm update
```

### Backup

Recomenda-se configurar backups regulares:
1. Do código-fonte (usando Git)
2. Do arquivo `credentials.json`
3. Da planilha do Google Sheets

## Solução de Problemas

### Erros Comuns

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

Ative logs detalhados definindo `LOG_LEVEL=debug` no arquivo `.env`:

```bash
LOG_LEVEL=debug npm start
```

## Próximos Passos

1. Adicionar suporte a mais tipos de campos do Typeform
2. Implementar fila de processamento para alta demanda
3. Adicionar painel administrativo
4. Melhorar tratamento de erros e retentativas
5. Adicionar testes automatizados

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento ou abra uma issue no repositório do projeto.
