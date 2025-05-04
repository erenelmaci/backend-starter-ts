import i18next from 'i18next'
import * as i18nextHttpMiddleware from 'i18next-http-middleware'
import Backend from 'i18next-fs-backend'
import path from 'path'

i18next
  .use(Backend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    fallbackLng: 'tr',
    preload: ['tr'],
    supportedLngs: ['tr'],
    ns: ['common', 'errors', 'auth', 'validation'],
    defaultNS: 'common',
    detection: {
      order: ['querystring', 'cookie', 'header'],
      lookupQuerystring: 'lang',
      lookupCookie: 'language',
      lookupHeader: 'accept-language',
      caches: ['cookie'],
    },
    debug: true,
  })

export default i18next
