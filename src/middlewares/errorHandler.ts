import CONSTANTS from '../config/constants'
import { NextFunction, Request, Response } from 'express'

interface CustomError extends Error {
  errorCode?: string
  code?: string
  missingFields?: string[]
  cause?: string
}

interface ErrorData {
  error: boolean
  method: string
  code?: string
  details?: string[]
  status?: number
  message?: string
  cause?: string
  internal?: string
  stack?: string
  body?: any
}

type ErrorCode = keyof typeof CONSTANTS.ERRORS

const ErrorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  let errorData: ErrorData = {
    error: true,
    method: req.method,
    code: err.errorCode || err.code,
  }

  if (err.missingFields) {
    errorData.details = err.missingFields
  }

  const errorCode = errorData.code as ErrorCode
  if (errorCode && CONSTANTS.ERRORS[errorCode]) {
    const errorInfo = CONSTANTS.ERRORS[errorCode]
    errorData.status = typeof errorInfo[0] === 'number' ? errorInfo[0] : 500
    errorData.message = typeof errorInfo[1] === 'string' ? errorInfo[1] : err.message
    errorData.cause = typeof errorInfo[2] === 'string' ? errorInfo[2] : err.cause
  } else {
    errorData.status = 500
    errorData.message = err.message
    errorData.cause = err.cause
  }

  if (process.env?.ENV !== 'production') {
    errorData = {
      ...errorData,
      internal: err.message,
      stack: err.stack,
      body: req.body,
    }

    if (err.missingFields) {
      errorData.details = err.missingFields
    }
  }

  return res.status(errorData.status || 500).send(errorData)
}

export default ErrorHandler
