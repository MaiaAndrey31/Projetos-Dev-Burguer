/**
 * @typedef {Object} HealthStatus
 * @property {boolean} googleSheets - Status do Google Sheets
 * @property {boolean} whatsapp - Status do serviço WhatsApp
 * @property {boolean} openai - Status da integração com OpenAI
 */

/**
 * @typedef {Object} HealthResponse
 * @property {string} status - Status geral do serviço ('ok', 'degraded', 'error')
 * @property {string} message - Mensagem descritiva do status
 * @property {string} timestamp - Timestamp ISO 8601 da verificação
 * @property {string} version - Versão da aplicação
 * @property {HealthStatus} services - Status individuais dos serviços
 * @property {string} [error] - Detalhes do erro (apenas em ambiente de desenvolvimento)
 */

import path from 'path';

export class HealthController {
  /**
   * @param {Object} googleSheetsRepository - Repositório do Google Sheets
   */
  constructor(googleSheetsRepository) {
    if (!googleSheetsRepository) {
      throw new Error('googleSheetsRepository é obrigatório');
    }
    this.googleSheetsRepository = googleSheetsRepository;
  }

  /**
   * Verifica a saúde dos serviços e retorna o status atual
   * @param {import('express').Request} req - Objeto de requisição do Express
   * @param {import('express').Response} res - Objeto de resposta do Express
   * @returns {Promise<import('express').Response>} Resposta HTTP com o status de saúde
   */
  async checkHealth(req, res) {
    try {
      const services = {
        googleSheets: false,
        whatsapp: false,
        openai: false
      };

      // Verifica a conexão com o Google Sheets
      try {
        services.googleSheets = await this.googleSheetsRepository.isAvailable();
      } catch (error) {
        console.error('Erro ao verificar Google Sheets:', error);
        services.googleSheets = false;
      }

      // Verifica as configurações dos serviços
      try {
        // Usando import dinâmico com caminho relativo corrigido
        const configPath = path.join(process.cwd(), 'src', 'config', 'index.js');
        const configModule = await import('file://' + configPath);
        const config = configModule.default || configModule;
        
        services.whatsapp = !!(config?.whatsapp?.apiKey && config.whatsapp.instanceId);
        services.openai = !!config?.openai?.apiKey;
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        services.whatsapp = false;
        services.openai = false;
      }

      // Define o status geral baseado nos serviços críticos
      const criticalServices = [services.googleSheets];
      const allCriticalServicesAvailable = criticalServices.every(Boolean);
      const someServicesUnavailable = Object.values(services).some(service => service === false);

      const status = {
        status: allCriticalServicesAvailable ? (someServicesUnavailable ? 'degraded' : 'ok') : 'error',
        message: allCriticalServicesAvailable 
          ? someServicesUnavailable 
            ? 'Serviço operacional com algumas funcionalidades limitadas'
            : 'Todos os serviços estão operacionais'
          : 'Serviço crítico indisponível',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        services
      };

      const statusCode = allCriticalServicesAvailable ? (someServicesUnavailable ? 206 : 200) : 503;
      return res.status(statusCode).json(status);
    } catch (error) {
      console.error('Erro crítico no health check:', error);
      
      return res.status(500).json({
        status: 'error',
        message: 'Falha ao verificar a saúde do serviço',
        error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }
}


