/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { pbkdf2Sync } from 'node:crypto';

/* -------------------------------------------------- */

const keyCode: string = process.env.SECRET_KEY || '';
const loopCount: number = 1000;
const charCount: number = 32;
const encType: string = 'sha512';

/**
 * PBKDF2 algoritms
 * @param password - hashed text
 * @returns string - (hex format)
 */
const encryptPassword = (password: string): string => {
  return pbkdf2Sync(password, keyCode, loopCount, charCount, encType).toString('hex');
};

export default encryptPassword;

/* -------------------------------------------------- */
