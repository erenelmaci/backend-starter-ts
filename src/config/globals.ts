/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Response } from 'express';
import systemSettings from './systemSettings';
import { Model } from 'mongoose';
import { IBaseDocument } from '../database/Model';
import mongoose from 'mongoose';
import CONSTANTS from './constants';

declare global {
  var DIR: string;
  var SETTINGS: any;
  var API_URL: string;
  var S3_PROFILE_IMAGES_PATH: string;
  var S3_DOCUMENTS_PATH: string;
  var SELECT_FIELDS: string;
  var ERRORS: typeof CONSTANTS.ERRORS;
  var view: (res: Response, status: number, output: Record<string, any>) => Response;
  var SendError: typeof SendErrorClass;
}

class SendErrorClass extends Error {
  errorCode: number;
  missingFields?: string[];

  constructor(errorCode: number, missingFields?: string[]) {
    super();
    this.errorCode = errorCode;
    this.missingFields = missingFields;
  }
}

global.DIR = process.cwd();
global.SETTINGS = systemSettings;
global.API_URL = (process.env.API_URL ?? 'http://localhost:3000')
  .replace(/\/+/g, '/')
  .replace(/\/$/g, '');
global.S3_PROFILE_IMAGES_PATH = (process.env.S3_PROFILE_IMAGES_PATH ?? '/profiles')
  .replace(/\/+/g, '/')
  .replace(/\/$/g, '');
global.S3_DOCUMENTS_PATH = (process.env.S3_DOCUMENTS_PATH ?? '/documents')
  .replace(/\/+/g, '/')
  .replace(/\/$/g, '');
global.SELECT_FIELDS =
  '-password -notes -createdByUserId -canUpdate -updatedByUserId -canDelete -deletedAtDate -deletedByUserId -isExists -__v ';

global.ERRORS = CONSTANTS.ERRORS;

global.view = function (res: Response, status: number, output: Record<string, any>): Response {
  return res.status(status).json({
    error: false,
    ...output,
  });
};

global.SendError = SendErrorClass;

export {};
