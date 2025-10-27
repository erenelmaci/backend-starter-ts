import { Request, Response, NextFunction } from 'express'
import { isUserLogin, isUserHasPermission } from '../../middlewares/Permissions'
import {
  getSessionStats,
  getUserSessionCount,
  getUserSessions,
  invalidateAllUserSessions,
} from '../../services/AuthService'

export const session = {
  // Session istatistikleri
  statsMiddlewares: [isUserLogin(), isUserHasPermission(['admin', 'read'])],
  stats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await getSessionStats()
      view(res, 200, stats)
    } catch (error) {
      next(error)
    }
  },

  // User'ın session sayısı
  userCountMiddlewares: [isUserLogin(), isUserHasPermission(['admin', 'read'])],
  userCount: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params
      const count = await getUserSessionCount(userId)
      view(res, 200, { userId, sessionCount: count })
    } catch (error) {
      next(error)
    }
  },

  // User'ın aktif session'ları
  userSessionsMiddlewares: [isUserLogin(), isUserHasPermission(['admin', 'read'])],
  userSessions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params
      const sessions = await getUserSessions(userId)
      view(res, 200, { userId, sessions })
    } catch (error) {
      next(error)
    }
  },

  // User'ın tüm session'larını geçersiz kıl
  invalidateUserSessionsMiddlewares: [isUserLogin(), isUserHasPermission(['admin', 'delete'])],
  invalidateUserSessions: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.params
      await invalidateAllUserSessions(userId)
      view(res, 200, { message: `All sessions invalidated for user ${userId}` })
    } catch (error) {
      next(error)
    }
  },
}
