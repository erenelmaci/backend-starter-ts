import { Router } from 'express'
import { session } from './controllers'

const router = Router()

// Session yönetimi endpoint'leri
router.get('/stats', session.statsMiddlewares, session.stats)
router.get('/user/:userId/count', session.userCountMiddlewares, session.userCount)
router.get('/user/:userId/sessions', session.userSessionsMiddlewares, session.userSessions)
router.delete(
  '/user/:userId/sessions',
  session.invalidateUserSessionsMiddlewares,
  session.invalidateUserSessions,
)

export default router
