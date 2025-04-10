/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Environment değişkenlerini yükle
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

console.log('Environment:', process.env.NODE_ENV);

// Global değişkenleri ve konfigürasyonları import et
import './src/config/globals';
import { connectToMongoDB } from './src/database/mongodb';
import middlewares from './src/middlewares/index';
// import errorHandler from './src/middlewares/errorHandler';

// Express uygulamasını oluştur
const app = express();

// Temel konfigürasyonlar
app.set('env', process.env.ENV);
app.disable('x-powered-by');

// MongoDB'ye bağlan
connectToMongoDB();

// CORS ayarları
if (process.env.ORIGIN && process.env.ORIGIN.length >= 4) {
  const origins = process.env.ORIGIN.replace(/\s*/g, '')
    .split(',')
    .flatMap(domain => [
      `http://${domain}`,
      `http://*.${domain}`,
      `https://${domain}`,
      `https://*.${domain}`,
    ]);

  app.use(
    cors({
      origin: origins,
      methods: 'GET, POST, PUT, PATCH, DELETE',
    }),
  );
} else {
  app.use(cors());
}

// JSON ve Form verilerini işle
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Middleware'leri uygula
app.use(middlewares);

// Route'ları uygula
// app.use(routes);

// Cron işlerini başlat
// import './tasks';

// Hata yakalayıcı
// app.use(errorHandler);

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || '';
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${API_URL} | PID:${process.pid}`);
});

// Cron endpoint'i
// app.get('/cron-job', cronJob);

// Test verilerini sıfırlama endpoint'i
// app.get('/reset-to-test-data-34caRwZcR32kicFYEkIhhM4g9LDSwjQk', resetToTestData);
