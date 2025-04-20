/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
'use strict';
/* -------------------------------------------------- */

import { Request, Response, NextFunction } from 'express';
import { existsSync, rmSync } from 'node:fs';
import CONSTANTS from '../config/constants';

// Custom error interface
interface CustomError extends Error {
  errorCode?: string;
  code?: string;
  missingFields?: string[];
  cause?: string;
}

// Error response interface
interface ErrorResponse {
  error: boolean;
  method: string;
  code?: string;
  status: number;
  message: string;
  cause?: string;
  internal?: string;
  stack?: string;
  body?: any;
  details?: string[];
}

// SendError class
export class SendError extends Error {
  public errorCode: string;
  public missingFields?: string[];

  constructor(errorCode: string, missingFields?: string[] | string) {
    super();
    this.errorCode = errorCode;
    this.missingFields = Array.isArray(missingFields)
      ? missingFields
      : missingFields
        ? [missingFields]
        : undefined;
  }
}

// ErrorHandler middleware
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  // Error code'u al
  const errorCode = err.errorCode as keyof typeof CONSTANTS.ERRORS;

  // Default error değerleri
  const defaultStatus = 500;
  const defaultMessage = err.message || 'Internal Server Error';
  const defaultCause = err.cause;

  // CONSTANTS.ERRORS'dan hata bilgilerini al ve tip kontrolü yap
  const errorInfo = CONSTANTS.ERRORS[errorCode];

  // Hata verisi oluştur
  const errorData: ErrorResponse = {
    error: true,
    method: req.method,
    code: err.errorCode || err.code,
    status: errorInfo ? Number(errorInfo[0]) : defaultStatus,
    message: errorInfo ? String(errorInfo[1]) : defaultMessage,
    cause: errorInfo && errorInfo[2] ? String(errorInfo[2]) : defaultCause,
  };

  // Eksik alanları ekle
  if (err.missingFields) {
    errorData.details = err.missingFields;
  }

  // Development ortamında ek bilgiler ekle
  if (process.env.NODE_ENV !== 'production') {
    Object.assign(errorData, {
      internal: err.message,
      stack: err.stack,
      body: req.body,
    });
  }

  // Yanıt döndür
  return res.status(errorData.status).json(errorData);
};

/* -------------------------------------------------- */

export default errorHandler;
