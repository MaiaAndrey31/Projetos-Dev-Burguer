# Executando a Aplicação com Docker

Este guia explica como executar a aplicação Typeform para Google Sheets usando Docker.

## Pré-requisitos

- Docker instalado na sua máquina
- Docker Compose (geralmente já vem com o Docker Desktop)
- Arquivo `credentials.json` do Google Cloud Platform
- Arquivo `.env` configurado (baseado no `.env.example`)

## Configuração Inicial

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositório>
   cd typeform-to-sheets-agent
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com as suas configurações.

3. **Adicione o arquivo de credenciais do Google**
   - Obtenha o arquivo `credentials.json` do Google Cloud Platform
   - Coloque-o na raiz do projeto

## Construindo e Executando com Docker

### Ambiente de Produção

1. **Construa a imagem**
   ```bash
   docker-compose build
   ```

2. **Inicie os contêineres**
   ```bash
   docker-compose up -d
   ```

3. **Verifique os logs**
   ```bash
   docker-compose logs -f
   ```

4. **Acesse a aplicação**
   - Acesse: http://localhost:3000
   - Verifique a saúde: http://localhost:3000/health

### Ambiente de Desenvolvimento

1. **Descomente o serviço `dev` no `docker-compose.yml`**
   ```yaml
   dev:
     build:
       context: .
       target: development
     container_name: typeform-agent-dev
     ports:
       - "3001:3000"
     env_file:
       - .env
     environment:
       - NODE_ENV=development
       - NODE_OPTIONS=--inspect=0.0.0.0:9229
     volumes:
       - .:/app
       - /app/node_modules
     command: npm run dev
   ```

2. **Inicie o contêiner de desenvolvimento**
   ```bash
   docker-compose up -d dev
   ```

3. **Acesse a aplicação de desenvolvimento**
   - Acesse: http://localhost:3001

## Comandos Úteis

- **Parar os contêineres**: `docker-compose down`
- **Reconstruir e reiniciar**: `docker-compose up -d --build`
- **Ver logs**: `docker-compose logs -f`
- **Abrir terminal no contêiner**: `docker-compose exec app sh`
- **Verificar saúde**: `curl http://localhost:3000/health`

## Solução de Problemas

### Erro de porta já em uso
Se a porta 3000 já estiver em uso, você pode:
1. Parar o serviço que está usando a porta
2. Mudar a porta no arquivo `.env`
   ```
   PORT=3001
   ```

### Erro de permissão
Se encontrar erros de permissão, tente:
```bash
sudo chown -R $USER:$USER .
```

### Limpar recursos não utilizados
```bash
docker system prune -a --volumes
```

## Configuração Avançada

### Variáveis de Ambiente
Consulte o arquivo `.env.example` para todas as variáveis de ambiente disponíveis.

### Volumes
A aplicação usa volumes nomeados para persistência de dados:
- `app_data`: Dados da aplicação
- `app_logs`: Logs da aplicação

### Rede
A aplicação usa a rede padrão do Docker Compose. Para configurações personalizadas, edite o `docker-compose.yml`.

## Segurança

- Nunca faça commit de arquivos sensíveis (`.env`, `credentials.json`)
- Use HTTPS em produção
- Mantenha as imagens do Docker atualizadas

## Monitoramento

A aplicação expõe um endpoint de saúde em `/health` que pode ser usado para monitoramento.

## Desenvolvimento

Para desenvolvimento, é recomendado usar o modo de desenvolvimento do Docker, que monta o código-fonte como um volume, permitindo alterações em tempo real.

```bash
docker-compose up -d dev
```

Isso irá:
- Montar o código-fonte local como um volume
- Executar o servidor em modo de desenvolvimento
- Mapear a porta 3001 para acesso local

## Produção

Para produção, certifique-se de:
1. Usar `NODE_ENV=production`
2. Configurar HTTPS
3. Implementar monitoramento
4. Configurar backups dos volumes
5. Implementar logs centralizados

## Licença

[MIT](LICENSE)
