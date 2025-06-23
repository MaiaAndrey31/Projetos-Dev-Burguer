# Executando a Aplicação com Docker

## Pré-requisitos
- Docker e Docker Compose instalados
- Arquivo `.env` configurado com as credenciais necessárias
- Arquivo `credentials.json` do Google Cloud Platform

## Configuração Inicial

1. Certifique-se de que os seguintes arquivos existam no diretório raiz:
   - `.env` com as variáveis de ambiente necessárias
   - `credentials.json` com as credenciais do Google Cloud Platform

## Como Executar

### 1. Construir e Iniciar os Contêineres

```bash
docker-compose up -d --build
```

### 2. Verificar os Logs

```bash
docker-compose logs -f
```

### 3. Acessar a Aplicação

A aplicação estará disponível em: http://localhost:3000

### 4. Parar os Contêineres

```bash
docker-compose down
```

## Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contenha todas as variáveis necessárias:

```
PORT=3000
NODE_ENV=production
GOOGLE_SHEET_ID=seu_id_da_planilha
WHATSAPP_API_KEY=sua_chave_api_whatsapp
WHATSAPP_INSTANCE_ID=sua_instancia
WHATSAPP_API_URL=sua_url_da_api
```

## Solução de Problemas

### Se o contêiner não iniciar

1. Verifique os logs:
   ```bash
   docker-compose logs app
   ```

2. Verifique se todas as variáveis de ambiente estão corretas

3. Verifique se as permissões dos arquivos estão corretas

### Se o healthcheck falhar

Verifique se a aplicação está respondendo corretamente no endpoint de health:

```bash
curl http://localhost:3000/health
```

## Desenvolvimento

Para desenvolvimento com hot-reload, use o serviço de desenvolvimento:

```bash
docker-compose -f docker-compose.dev.yml up --build
```
