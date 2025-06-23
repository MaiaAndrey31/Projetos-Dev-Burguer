import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const config = {
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  google: {
    sheetId: process.env.GOOGLE_SHEET_ID,
    credentials: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  },
  whatsapp: {
    apiKey: process.env.WHATSAPP_API_KEY,
    instanceId: process.env.WHATSAPP_INSTANCE_ID,
    apiUrl: process.env.WHATSAPP_API_URL || 'https://api.ultramsg.com'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};

export default config;
