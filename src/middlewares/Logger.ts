// src/middlewares/logger.middleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      responseTime: `${duration}ms`,
    };

    logger.info('Request completed', log);
  });

  next();
};
