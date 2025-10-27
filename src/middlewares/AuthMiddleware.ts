import { Response, NextFunction } from 'express'
import { ExpressRequestInterface } from '../interface/ExpressRequestInterface'
import User, { IUser } from '../apps/user/model'
import { RedisUserModel } from '../cache/model/RedisUserModel'
import { db } from '../database/Controller'
import { validateToken } from '../services/AuthService'

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export const AuthMiddleware = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Token'ı hem header'dan hem cookie'den al
    const headerToken = (req.headers as any).authorization?.split(' ')[1]
    const cookieToken = req.cookies?.token

    const token = headerToken || cookieToken

    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' })
    }

    // Client bilgilerini al
    const userAgent = req.headers['user-agent'] || 'unknown'
    const ip = req.ip || req.connection.remoteAddress || 'unknown'

    const user = await validateToken(token, userAgent, ip)
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz token' })
    }

    req.user = user as IUser
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ message: 'Kimlik doğrulama hatası' })
  }
}
