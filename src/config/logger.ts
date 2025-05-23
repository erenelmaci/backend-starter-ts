import path from 'path'
import winston from 'winston'

const logPath = path.join(__dirname, '../../logs')

// JSON formatlı log
const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.json())

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${logPath}/app.log` }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

export default logger
