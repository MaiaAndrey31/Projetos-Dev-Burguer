#!/usr/bin/env node

/**
 * Ponto de entrada da aplicação
 * Inicia o servidor HTTP e configura o encerramento gracioso
 */

import App from './app.js';
import logger from './config/logger.js';

// Trata erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição não tratada:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  process.exit(1);
});

// Inicia a aplicação
async function start() {
  try {
    logger.info('Iniciando aplicação...');
    
    const app = new App();
    logger.info('Nova instância do App criada');
    
    try {
      // Aguarda a inicialização dos serviços antes de iniciar o servidor
      logger.info('Inicializando serviços...');
      await app.initializeServices();
      logger.info('Serviços inicializados com sucesso');
      
      // Configura as rotas após a inicialização dos serviços
      logger.info('Configurando rotas...');
      app.initializeRoutes();
      logger.info('Rotas configuradas com sucesso');
      
      // Inicia o servidor
      logger.info('Iniciando servidor...');
      await app.start();
      
      // Trata encerramento gracioso
      const shutdown = async () => {
        logger.info('Encerrando aplicação...');
        try {
          await app.stop();
          logger.info('Aplicação encerrada com sucesso');
          process.exit(0);
        } catch (shutdownError) {
          logger.error('Erro ao encerrar a aplicação:', shutdownError);
          process.exit(1);
        }
      };
      
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
      
      logger.info(`Aplicação iniciada com sucesso na porta ${app.port} (${process.env.NODE_ENV || 'development'})`);
      
    } catch (appError) {
      logger.error('Erro durante a inicialização da aplicação:', {
        message: appError.message,
        stack: appError.stack,
        name: appError.name
      });
      throw appError;
    }
    
  } catch (error) {
    logger.error('Falha crítica ao iniciar a aplicação:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  }
}

// Inicia a aplicação
start().catch(error => {
  logger.error('Erro fatal ao iniciar a aplicação:', error);
  process.exit(1);
});
