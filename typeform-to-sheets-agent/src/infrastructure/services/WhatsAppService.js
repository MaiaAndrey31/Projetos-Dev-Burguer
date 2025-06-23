import axios from 'axios';
import config from '../../config/index.js';
import logger from '../../config/logger.js';

export class WhatsAppService {
  constructor() {
    this.isConfigured = !!(config.whatsapp.apiKey && config.whatsapp.instanceId);
    this.baseUrl = `${config.whatsapp.apiUrl}/${config.whatsapp.instanceId}/messages/chat`;
  }

  /**
   * Formata o número de telefone para o padrão internacional
   * @param {string} phone - Número de telefone
   * @returns {string} Número formatado
   */
  formatPhoneNumber(phone) {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+55${phone.replace(/\D/g, '')}`;
  }

  /**
   * Envia uma mensagem de texto
   * @param {string} to - Número de telefone do destinatário
   * @param {string} message - Mensagem a ser enviada
   * @returns {Promise<Object>} Resposta da API
   */
  async sendTextMessage(to, message) {
    if (!this.isConfigured) {
      throw new Error('Serviço de WhatsApp não configurado corretamente');
    }

    const phoneNumber = this.formatPhoneNumber(to);
    if (!phoneNumber) {
      throw new Error('Número de telefone inválido');
    }

    try {
      const response = await axios({
        method: 'post',
        url: this.baseUrl,
        data: {
          token: config.whatsapp.apiKey,
          to: phoneNumber,
          body: message
        },
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.sent) {
        logger.info(`Mensagem enviada para ${phoneNumber}`, { messageId: response.data.id });
      } else {
        logger.warn('Resposta inesperada da API do WhatsApp', { response: response.data });
      }

      return response.data;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        phone: phoneNumber,
        url: this.baseUrl
      };

      if (error.response) {
        errorDetails.status = error.response.status;
        errorDetails.data = error.response.data;
      } else if (error.request) {
        errorDetails.details = 'Sem resposta do servidor';
      }

      logger.error('Erro ao enviar mensagem pelo WhatsApp', errorDetails);
      throw error;
    }
  }

  /**
   * Envia uma mensagem de confirmação de cadastro
   * @param {string} phone - Número de telefone do destinatário
   * @param {string} name - Nome do destinatário
   * @returns {Promise<Object>} Resposta da API
   */
  async sendWelcomeMessage(phone, name) {
    const message = `Olá ${name || 'cliente'}, recebemos os seus dados 🎉\n\n` +
                   `Seu prêmio foi adicionado ao seu perfil no Dev Club.\n\n` +
                   `Parabéns pelo seu resultado!`;

    return this.sendTextMessage(phone, message);
  }
}


