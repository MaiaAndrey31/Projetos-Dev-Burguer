import { FormResponse } from '../entities/FormResponse.js';

export class ProcessFormResponse {
  constructor({
    sheetsRepository,
    whatsAppService,
    openAIService,
    logger
  }) {
    this.sheetsRepository = sheetsRepository;
    this.whatsAppService = whatsAppService;
    this.openAIService = openAIService;
    this.logger = logger || console;
  }

  /**
   * Processa uma resposta do Typeform
   * @param {Object} formData - Dados do formulário do Typeform
   * @returns {Promise<Object>} Resultado do processamento
   */
  async execute(formData) {
    try {
      this.logger.info('Iniciando processamento da resposta do Typeform');
      
      // Cria a entidade de resposta do formulário
      const formResponse = new FormResponse({
        formId: formData.form_id,
        submittedAt: formData.submitted_at,
        answers: formData.answers || []
      });

      // Processa o nome com OpenAI, se disponível
      const name = formResponse.getAnswer('nome_completo');
      if (name && this.openAIService) {
        formResponse.processedName = await this.openAIService.formatName(name);
      }

      // Prepara os dados para a planilha
      const rowData = formResponse.toSpreadsheetRow();
      
      // Salva na planilha
      await this.sheetsRepository.appendRow(rowData);

      // Envia notificação por WhatsApp, se configurado
      const phone = formResponse.contact.phone;
      if (phone && this.whatsAppService) {
        try {
          await this.whatsAppService.sendWelcomeMessage(
            phone,
            formResponse.processedName || formResponse.contact.name
          );
        } catch (error) {
          this.logger.error('Erro ao enviar WhatsApp:', error);
          // Não interrompe o fluxo em caso de erro no WhatsApp
        }
      }

      return {
        success: true,
        message: 'Resposta processada com sucesso',
        data: {
          name: formResponse.processedName || formResponse.contact.name,
          email: formResponse.contact.email,
          phone: formResponse.contact.phone
        }
      };
    } catch (error) {
      this.logger.error('Erro ao processar resposta:', error);
      throw error;
    }
  }
}


