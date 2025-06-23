import winston from 'winston';
import config from './index.js';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

// Cria um stream para o morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
