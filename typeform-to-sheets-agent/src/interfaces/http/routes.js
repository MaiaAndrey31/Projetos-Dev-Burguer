import express from 'express';
const router = express.Router();

// Importa os controladores
import { HealthController } from './HealthController.js';
import { TypeformController } from '../webhook/TypeformController.js';

/**
 * Configura as rotas da aplicação
 * @param {Object} dependencies - Dependências injetadas
 * @returns {Object} Router do Express configurado
 */
function setupRoutes(dependencies) {
  const { healthController, typeformController } = dependencies;

  // Rota de health check
  router.get('/health', (req, res) => healthController.checkHealth(req, res));

  // Webhook do Typeform
  router.post('/webhook', 
    express.json({ limit: '10mb' }), // Middleware para parsear JSON
    (req, res) => typeformController.handleWebhook(req, res)
  );

  // Rota de teste (apenas para desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    router.get('/test', (req, res) => {
      res.json({ status: 'ok', message: 'Test endpoint is working' });
    });
  }

  // Middleware para rota não encontrada
  router.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Rota não encontrada',
      timestamp: new Date().toISOString()
    });
  });

  // Middleware de tratamento de erros
  router.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    
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

  return router;
}

export { setupRoutes };
