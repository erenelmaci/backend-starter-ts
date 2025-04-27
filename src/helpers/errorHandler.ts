/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
/* -------------------------------------------------- */

import { Request, Response } from 'express';
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
export const errorHandler = (err: CustomError, req: Request, res: Response): Response => {
  const errorCode = err.errorCode as keyof typeof CONSTANTS.ERRORS;

  const defaultStatus = 500;
  const defaultMessage = err.message || 'Internal Server Error';
  const defaultCause = err.cause;

  const errorInfo = CONSTANTS.ERRORS[errorCode];

  const errorData: ErrorResponse = {
    error: true,
    method: req.method,
    code: err.errorCode || err.code,
    status: errorInfo ? Number(errorInfo[0]) : defaultStatus,
    message: errorInfo ? String(errorInfo[1]) : defaultMessage,
    cause: errorInfo && errorInfo[2] ? String(errorInfo[2]) : defaultCause,
  };

  if (err.missingFields) {
    errorData.details = err.missingFields;
  }

  if (process.env.NODE_ENV !== 'production') {
    Object.assign(errorData, {
      internal: err.message,
      stack: err.stack,
      body: req.body,
    });
  }

  return res.status(errorData.status).json(errorData);
};

/* -------------------------------------------------- */

export default errorHandler;
