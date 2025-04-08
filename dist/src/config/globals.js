"use strict";
/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const systemSettings_1 = __importDefault(require("./systemSettings"));
// SendError sınıfı tanımı
class SendErrorClass extends Error {
    constructor(errorCode, missingFields) {
        super();
        this.errorCode = errorCode;
        this.missingFields = missingFields;
    }
}
// Global değişken tanımlamaları
globalThis.DIR = process.cwd();
globalThis.SETTINGS = systemSettings_1.default;
globalThis.API_URL = ((_a = process.env.API_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3000')
    .replace(/\/+/g, '/')
    .replace(/\/$/g, '');
globalThis.PROFILE_IMAGES_URL = ((_b = process.env.PROFILE_IMAGES_URL) !== null && _b !== void 0 ? _b : '/profiles')
    .replace(/\/+/g, '/')
    .replace(/\/$/g, '');
globalThis.DOCUMENTS_URL = ((_c = process.env.DOCUMENTS_URL) !== null && _c !== void 0 ? _c : '/documents')
    .replace(/\/+/g, '/')
    .replace(/\/$/g, '');
globalThis.SELECT_FIELDS =
    '-password -notes -createdByUserId -canUpdate -updatedByUserId -canDelete -deletedAtDate -deletedByUserId -isExists -__v ';
// Global fonksiyon tanımlaması
globalThis.view = function (res, method, status, output) {
    return res.status(status).send(Object.assign({ error: false, method: method }, output));
};
globalThis.SendError = SendErrorClass;
