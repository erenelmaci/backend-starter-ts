import i18next from 'i18next'
import i18nextHttpMiddleware from 'i18next-http-middleware'

declare global {
  namespace Express {
    interface Request {
      t: (key: string, options?: any) => string
      language: string
    }
  }
}

export const i18nMiddleware = i18nextHttpMiddleware.handle(i18next)
