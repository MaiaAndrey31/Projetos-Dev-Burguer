import axios from 'axios';
import config from '../../config/index.js';
import logger from '../../config/logger.js';

export class OpenAIService {
  constructor() {
    this.isConfigured = !!config.openai.apiKey;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Formata um nome usando a API da OpenAI
   * @param {string} name - Nome a ser formatado
   * @returns {Promise<string>} Nome formatado
   */
  async formatName(name) {
    if (!this.isConfigured || !name) {
      return name || '';
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: config.openai.model,
          messages: [{
            role: 'user',
            content: `Formate este nome próprio corretamente: "${name}". Apenas o nome formatado, sem aspas.`
          }],
          temperature: 0.3,
          max_tokens: 100
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 segundos de timeout
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      logger.error('Erro ao processar nome com OpenAI:', error.message);
      // Em caso de erro, retorna o nome original
      return name;
    }
  }
}


