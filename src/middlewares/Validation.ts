/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
/* -------------------------------------------------- */

import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'
import { SendError } from '../helpers/errorHandler'

interface ValidationSchemas {
  [key: string]: Joi.ObjectSchema
}

interface ValidationError {
  type: string
  statusCode: number
  message: string
}

interface ValidatableRequest {
  body?: any
  params?: any
  query?: any
  [key: string]: any
}

export const validationMiddleware = (schemas: ValidationSchemas) => {
  return async (req: Request & ValidatableRequest, res: Response, next: NextFunction) => {
    try {
      for (const [source, schema] of Object.entries(schemas)) {
        if (['body', 'params', 'query'].includes(source)) {
          const validateData = await schema.validateAsync(req[source], {
            stripUnknown: true,
            abortEarly: false,
          })

          req[source] = validateData
        }
      }
      next()
    } catch (error: any) {
      const err: ValidationError = {
        type: 'Validation error',
        statusCode: 400,
        message: error.message,
      }

      throw new SendError('VALIDATION_ERROR', err.message)
    }
  }
}

/* -------------------------------------------------- */

export default validationMiddleware
