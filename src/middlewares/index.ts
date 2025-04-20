import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { i18nMiddleware } from './i18n';

const middlewares = [
  // Güvenlik başlıkları
  helmet(),

  // Request logger
  (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
  },

  // CORS öncesi kontroller
  (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  },

  // i18nMiddleware,
];

export default middlewares;
