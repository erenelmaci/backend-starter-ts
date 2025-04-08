"use strict";
/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = require("node:crypto");
/* -------------------------------------------------- */
// Şifreleme için gerekli sabitler
const keyCode = process.env.SECRET_KEY || '';
const loopCount = 1000;
const charCount = 32;
const encType = 'sha512';
/**
 * Verilen şifreyi PBKDF2 algoritması ile şifreler
 * @param password - Şifrelenecek metin
 * @returns string - Şifrelenmiş metin (hex formatında)
 */
const encryptPassword = (password) => {
    return (0, node_crypto_1.pbkdf2Sync)(password, keyCode, loopCount, charCount, encType).toString('hex');
};
exports.default = encryptPassword;
/* -------------------------------------------------- */
