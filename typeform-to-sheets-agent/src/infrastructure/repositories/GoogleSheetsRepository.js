import { google } from 'googleapis';
import config from '../../config/index.js';
import logger from '../../config/logger.js';

export class GoogleSheetsRepository {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: config.google.credentials,
      scopes: config.google.scopes,
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Adiciona uma nova linha à planilha
   * @param {Array} rowData - Dados da linha a ser adicionada
   * @param {string} [range='Página1!A2'] - Intervalo da planilha
   * @returns {Promise<Object>} Resposta da API do Google Sheets
   */
  async appendRow(rowData, range = 'Página1!A2') {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: config.google.sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowData]
        }
      });

      logger.info('Dados salvos com sucesso no Google Sheets');
      return response.data;
    } catch (error) {
      logger.error('Erro ao salvar no Google Sheets:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se a planilha está acessível
   * @returns {Promise<boolean>} Verdadeiro se acessível
   */
  async isAvailable() {
    try {
      if (!config.google.sheetId) {
        return false;
      }
      
      await this.sheets.spreadsheets.get({
        spreadsheetId: config.google.sheetId,
        fields: 'properties/title',
      });
      
      return true;
    } catch (error) {
      logger.error('Erro ao acessar o Google Sheets:', error.message);
      return false;
    }
  }
}


