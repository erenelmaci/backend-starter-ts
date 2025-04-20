/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
'use strict';
/* -------------------------------------------------- */

import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { SendError } from '../helpers/errorHandler';

// Validasyon şemaları için interface
interface ValidationSchemas {
  [key: string]: Joi.ObjectSchema;
}

// Validasyon hatası için interface
interface ValidationError {
  type: string;
  statusCode: number;
  message: string;
}

// Request nesnesinin validasyon edilebilir alanları için interface
interface ValidatableRequest {
  body?: any;
  params?: any;
  query?: any;
  [key: string]: any;
}

export const validationMiddleware = (schemas: ValidationSchemas) => {
  return async (req: Request & ValidatableRequest, res: Response, next: NextFunction) => {
    try {
      // Her bir schema için validasyon yap
      for (const [source, schema] of Object.entries(schemas)) {
        // Sadece validasyon edilebilir alanları kontrol et
        if (['body', 'params', 'query'].includes(source)) {
          const validateData = await schema.validateAsync(req[source], {
            stripUnknown: true,
            abortEarly: false,
          });

          // Doğrulanmış veriyi request nesnesine ata
          req[source] = validateData;
        }
      }
      next();
    } catch (error: any) {
      const err: ValidationError = {
        type: 'Validation error',
        statusCode: 400,
        message: error.message,
      };

      throw new SendError('VALIDATION_ERROR', err.message);
    }
  };
};

/* -------------------------------------------------- */

export default validationMiddleware;
