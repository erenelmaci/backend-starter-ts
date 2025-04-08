"use strict";
/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Environment değişkenlerini yükle
dotenv_1.default.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});
console.log('Environment:', process.env.NODE_ENV);
// Global değişkenleri ve konfigürasyonları import et
require("./src/config/globals");
const mongodb_1 = require("./src/database/mongodb");
const index_1 = __importDefault(require("./src/middlewares/index"));
// import errorHandler from './src/middlewares/errorHandler';
// Express uygulamasını oluştur
const app = (0, express_1.default)();
// Temel konfigürasyonlar
app.set('env', process.env.ENV);
app.disable('x-powered-by');
// MongoDB'ye bağlan
(0, mongodb_1.connectToMongoDB)();
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
    app.use((0, cors_1.default)({
        origin: origins,
        methods: 'GET, POST, PUT, PATCH, DELETE',
    }));
}
else {
    app.use((0, cors_1.default)());
}
// JSON ve Form verilerini işle
app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook') {
        express_1.default.raw({ type: 'application/json' })(req, res, next);
    }
    else {
        express_1.default.json()(req, res, next);
    }
});
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware'leri uygula
app.use(index_1.default);
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
