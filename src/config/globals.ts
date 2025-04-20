/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Response } from 'express';
import systemSettings from './systemSettings';
import { Model } from 'mongoose';
import { BaseController } from '../database/BaseController';
import { IBaseDocument } from '../database/BaseModel';
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
  var db: {
    list: <T extends IBaseDocument>(model: Model<T>, query?: any, options?: any) => Promise<any>;
    create: <T extends IBaseDocument>(model: Model<T>, data: Partial<T>) => Promise<T>;
    read: <T extends IBaseDocument>(model: Model<T>, filter: any) => Promise<T | null>;
    update: <T extends IBaseDocument>(
      model: Model<T>,
      id: mongoose.Types.ObjectId,
      data: Partial<T>,
    ) => Promise<T | null>;
    delete: <T extends IBaseDocument>(
      model: Model<T>,
      id: mongoose.Types.ObjectId,
    ) => Promise<T | null>;
  };
  var view: (res: Response, status: number, output: Record<string, any>) => Response;
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

global.db = {
  list: async <T extends IBaseDocument>(model: Model<T>, query?: any, options?: any) => {
    const controller = new BaseController(model);
    return controller.list(query, options);
  },
  create: async <T extends IBaseDocument>(model: Model<T>, data: Partial<T>) => {
    const controller = new BaseController(model);
    return controller.create(data);
  },
  read: async <T extends IBaseDocument>(model: Model<T>, filter: any) => {
    const controller = new BaseController(model);
    return controller.read(filter);
  },
  update: async <T extends IBaseDocument>(
    model: Model<T>,
    id: mongoose.Types.ObjectId,
    data: Partial<T>,
  ) => {
    const controller = new BaseController(model);
    return controller.update(id.toString(), data);
  },
  delete: async <T extends IBaseDocument>(model: Model<T>, id: mongoose.Types.ObjectId) => {
    const controller = new BaseController(model);
    return controller.delete(id.toString());
  },
};

// Global fonksiyon tanımlaması
global.view = function (res: Response, status: number, output: Record<string, any>): Response {
  return res.status(status).json({
    error: false,
    ...output,
  });
};

global.SendError = SendErrorClass;

export {};
