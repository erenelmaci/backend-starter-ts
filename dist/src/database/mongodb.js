"use strict";
/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongoDB = void 0;
const mongoose_1 = __importDefault(require("./mongoose"));
/* -------------------------------------------------- */
/**
 * MongoDB bağlantısını yöneten fonksiyon
 * @returns Promise<void>
 */
const connectToMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }
        yield mongoose_1.default.connect(mongoURI);
        console.log('MongoDB bağlantısı başarılı');
    }
    catch (error) {
        console.error('MongoDB bağlantı hatası:', error);
        process.exit(1);
    }
});
exports.connectToMongoDB = connectToMongoDB;
/* -------------------------------------------------- */
