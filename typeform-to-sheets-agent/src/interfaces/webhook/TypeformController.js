export class TypeformController {
  constructor(processFormResponseUseCase) {
    this.processFormResponse = processFormResponseUseCase;
  }

  /**
   * Manipula as requisições do webhook do Typeform
   * @param {Object} req - Objeto de requisição do Express
   * @param {Object} res - Objeto de resposta do Express
   */
  async handleWebhook(req, res) {
    try {
      // Validação básica da requisição
      if (!req.body || !req.body.form_response) {
        return res.status(400).json({
          status: 'error',
          message: 'Formato de requisição inválido',
          timestamp: new Date().toISOString()
        });
      }

      // Processa a resposta do formulário
      const result = await this.processFormResponse.execute(req.body.form_response);
      
      // Retorna sucesso
      res.status(200).json({
        status: 'success',
        message: 'Resposta processada com sucesso',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro no webhook do Typeform:', error);
      
      // Retorna erro genérico para o cliente
      res.status(500).json({
        status: 'error',
        message: 'Erro ao processar a requisição',
        timestamp: new Date().toISOString()
      });
    }
  }
}


