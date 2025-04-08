/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */

import { Response } from 'express';
import systemSettings from './systemSettings';
// Global tip tanımlamaları
declare global {
  var DIR: string;
  var SETTINGS: any;
  var API_URL: string;
  var PROFILE_IMAGES_URL: string;
  var DOCUMENTS_URL: string;
  var SELECT_FIELDS: string;
  var view: (
    res: Response,
    method: string,
    status: number,
    output: Record<string, any>,
  ) => Response;
  var SendError: typeof SendErrorClass;
}

// SendError sınıfı tanımı
class SendErrorClass extends Error {
  errorCode: number;
  missingFields?: string[];

  constructor(errorCode: number, missingFields?: string[]) {
    super();
    this.errorCode = errorCode;
    this.missingFields = missingFields;
  }
}

// Global değişken tanımlamaları
globalThis.DIR = process.cwd();
globalThis.SETTINGS = systemSettings;
globalThis.API_URL = (process.env.API_URL ?? 'http://localhost:3000')
  .replace(/\/+/g, '/')
  .replace(/\/$/g, '');
globalThis.PROFILE_IMAGES_URL = (process.env.PROFILE_IMAGES_URL ?? '/profiles')
  .replace(/\/+/g, '/')
  .replace(/\/$/g, '');
globalThis.DOCUMENTS_URL = (process.env.DOCUMENTS_URL ?? '/documents')
  .replace(/\/+/g, '/')
  .replace(/\/$/g, '');
globalThis.SELECT_FIELDS =
  '-password -notes -createdByUserId -canUpdate -updatedByUserId -canDelete -deletedAtDate -deletedByUserId -isExists -__v ';

// Global fonksiyon tanımlaması
globalThis.view = function (
  res: Response,
  method: string,
  status: number,
  output: Record<string, any>,
): Response {
  return res.status(status).send({
    error: false,
    method: method,
    ...output,
  });
};

globalThis.SendError = SendErrorClass;

export {}; // Bu dosyanın bir modül olduğunu belirtmek için boş export
