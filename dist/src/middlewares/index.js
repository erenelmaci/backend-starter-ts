"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const middlewares = [
    // Güvenlik başlıkları
    (0, helmet_1.default)(),
    // Request logger
    (req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    },
    // CORS öncesi kontroller
    (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    },
];
exports.default = middlewares;
