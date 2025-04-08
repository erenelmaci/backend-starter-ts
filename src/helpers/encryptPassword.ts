/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */

import { pbkdf2Sync } from 'node:crypto';

/* -------------------------------------------------- */

// Şifreleme için gerekli sabitler
const keyCode: string = process.env.SECRET_KEY || '';
const loopCount: number = 1000;
const charCount: number = 32;
const encType: string = 'sha512';

/**
 * Verilen şifreyi PBKDF2 algoritması ile şifreler
 * @param password - Şifrelenecek metin
 * @returns string - Şifrelenmiş metin (hex formatında)
 */
const encryptPassword = (password: string): string => {
  return pbkdf2Sync(password, keyCode, loopCount, charCount, encType).toString('hex');
};

export default encryptPassword;

/* -------------------------------------------------- */
