import express from 'express';
import morgan from 'morgan';
import config from './config/index.js';
import logger from './config/logger.js';
import { setupRoutes } from './interfaces/http/routes.js';

class App {
  constructor() {
    this.app = express();
    this.port = config.app.port;
    this.dependencies = {};
    this.server = null;
    
    // Inicializa middlewares
    this.initializeMiddlewares();
    
    // Configura tratamento de erros
    this.initializeErrorHandling();
  }
  
  /**
   * Inicializa middlewares globais
   */
  initializeMiddlewares() {
    // Log de requisições HTTP
    this.app.use(morgan(config.logging.format, { 
      stream: { write: (message) => logger.info(message.trim()) } 
    }));
    
    // Parser de JSON
    this.app.use(express.json({ limit: '10mb' }));
    
    // Log de todas as requisições
    this.app.use((req, res, next) => {
      const start = Date.now();
      const timestamp = new Date().toISOString();
      
      // Log do corpo da requisição (exceto para arquivos grandes)
      if (req.body && Object.keys(req.body).length > 0) {
        logger.info(`[${timestamp}] ${req.method} ${req.originalUrl} - Body: ${JSON.stringify(req.body, null, 2)}`);
      } else {
        logger.info(`[${timestamp}] ${req.method} ${req.originalUrl}`);
      }
      
      // Captura o tempo de resposta
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        logger.info(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
      });
      
      next();
    });
  }
  
  /**
   * Inicializa serviços e repositórios
   */
  async initializeServices() {
    // Declare as variáveis no escopo da função para que estejam disponíveis em todo o método
    let sheetsRepository, whatsAppService, openAIService, processFormResponse;
    
    try {
      logger.info('Iniciando inicialização dos serviços...');
      
      // Importa os módulos usando a sintaxe de módulos ES
      logger.info('Importando GoogleSheetsRepository...');
      try {
        const { GoogleSheetsRepository } = await import('./infrastructure/repositories/GoogleSheetsRepository.js');
        sheetsRepository = new GoogleSheetsRepository();
        logger.info('GoogleSheetsRepository inicializado com sucesso');
      } catch (gsError) {
        logger.error('Erro ao inicializar GoogleSheetsRepository:', {
          message: gsError.message,
          stack: gsError.stack,
          code: gsError.code,
          path: gsError.path
        });
        throw gsError;
      }
      
      // Inicializa serviços
      logger.info('Inicializando WhatsAppService...');
      try {
        const { WhatsAppService } = await import('./infrastructure/services/WhatsAppService.js');
        whatsAppService = new WhatsAppService();
        logger.info('WhatsAppService inicializado com sucesso');
      } catch (wsError) {
        logger.error('Erro ao inicializar WhatsAppService:', wsError);
        throw wsError;
      }
      
      logger.info('Inicializando OpenAIService...');
      try {
        const { OpenAIService } = await import('./infrastructure/services/OpenAIService.js');
        openAIService = new OpenAIService();
        logger.info('OpenAIService inicializado com sucesso');
      } catch (aiError) {
        logger.error('Erro ao inicializar OpenAIService:', aiError);
        throw aiError;
      }
      
      // Inicializa casos de uso
      logger.info('Inicializando ProcessFormResponse...');
      try {
        const { ProcessFormResponse } = await import('./domain/usecases/ProcessFormResponse.js');
        processFormResponse = new ProcessFormResponse({
          sheetsRepository,
          whatsAppService,
          openAIService,
          logger
        });
        logger.info('ProcessFormResponse inicializado com sucesso');
      } catch (pfrError) {
        logger.error('Erro ao inicializar ProcessFormResponse:', pfrError);
        throw pfrError;
      }
      
      // Inicializa controladores
      logger.info('Inicializando controladores...');
      try {
        const { TypeformController } = await import('./interfaces/webhook/TypeformController.js');
        const typeformController = new TypeformController(processFormResponse);
        
        const { HealthController } = await import('./interfaces/http/HealthController.js');
        const healthController = new HealthController(sheetsRepository);
        
        // Armazena as dependências para uso nas rotas
        this.dependencies = {
          healthController,
          typeformController
        };
        
        logger.info('Controladores inicializados com sucesso');
      } catch (ctrlError) {
        logger.error('Erro ao inicializar controladores:', ctrlError);
        throw ctrlError;
      }
      
      logger.info('Todos os serviços foram inicializados com sucesso');
      return this.dependencies;
    } catch (error) {
      logger.error('Erro crítico durante a inicialização dos serviços:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        path: error.path
      });
      throw error;
    }
  }
  
  /**
   * Configura as rotas da aplicação
   */
  initializeRoutes() {
    if (!this.dependencies || !this.dependencies.healthController || !this.dependencies.typeformController) {
      throw new Error('Dependências não inicializadas. Chame initializeServices() primeiro.');
    }
    
    const router = setupRoutes(this.dependencies);
    this.app.use(router);
    logger.info('Rotas configuradas com sucesso');
  }
  
  /**
   * Configura o tratamento de erros global
   */
  initializeErrorHandling() {
    // Middleware para erros não tratados
    this.app.use((err, req, res, next) => {
      logger.error('Erro não tratado:', err);
      
      if (res.headersSent) {
        return next(err);
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { 
          error: err.message,
          stack: err.stack 
        }),
        timestamp: new Date().toISOString()
      });
    });
  }
  
  /**
   * Inicia o servidor
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.server) {
          this.server = this.app.listen(this.port, () => {
            logger.info(`Servidor rodando na porta ${this.port} (${process.env.NODE_ENV || 'development'})`);
            resolve();
          });
          
          this.server.on('error', (error) => {
            logger.error('Erro ao iniciar o servidor:', error);
            reject(error);
          });
        } else {
          resolve();
        }
      } catch (error) {
        logger.error('Erro ao iniciar o servidor:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Encerra o servidor
   */
  async stop() {
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server.close((error) => {
          if (error) {
            logger.error('Erro ao encerrar o servidor:', error);
            reject(error);
          } else {
            logger.info('Servidor encerrado com sucesso');
            this.server = null;
            resolve();
          }
        });
      });
    }
    
    // Limpa referências
    this.dependencies = {};
  }
}

// Se o arquivo for executado diretamente, inicia o servidor
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const app = new App();
  app.start().catch((error) => {
    logger.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  });
  
  // Trata encerramento gracioso
  const shutdown = async () => {
    logger.info('Encerrando aplicação...');
    await app.stop();
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default App;
