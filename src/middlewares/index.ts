import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
// import { i18nMiddleware } from './i18n';
import { requestLogger } from './Logger'

const middlewares = [
  helmet(),

  (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`)
    next()
  },

  (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  },

  requestLogger,

  // i18nMiddleware,
]

export default middlewares
