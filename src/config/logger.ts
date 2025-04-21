import path from 'path';
import winston from 'winston';

const logPath = path.join(__dirname, '../../logs');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (metadata) {
      log += ` | ${JSON.stringify(metadata)}`;
    }
    return log;
  }),
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${logPath}/app.log` }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default logger;
