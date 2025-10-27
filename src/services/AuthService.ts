import jwt from 'jsonwebtoken'
import User, { IUser } from '../apps/user/model'
import { db } from '../database/Controller'
import { SessionManager } from './SessionManager'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined')
}

const JWT_SECRET = process.env.JWT_SECRET

export const generateToken = async (user: IUser, userAgent?: string, ip?: string) => {
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // Issued at
      jti: `${user._id}_${Date.now()}`, // JWT ID - unique token identifier
    },
    JWT_SECRET,
    { expiresIn: '24h' },
  )

  // Session bilgilerini Redis'e kaydet
  const sessionData = {
    userId: (user._id as any).toString(),
    email: user.email,
    role: user.role,
    userAgent: userAgent || 'unknown',
    ip: ip || 'unknown',
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true,
  }

  await SessionManager.createSession(token, sessionData)

  return token
}

export const validateToken = async (token: string, userAgent?: string, ip?: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
      iat: number
      jti: string
    }

    // Session'ı Redis'den al
    const session = await SessionManager.getSession(token)
    if (!session) {
      return null
    }

    // Session güvenlik kontrolü
    const isSecure = await SessionManager.validateSessionSecurity(token, userAgent, ip)
    if (!isSecure) {
      return null
    }

    // Session'ı yenile (lastActivity güncelle)
    await SessionManager.refreshSession(token)

    const user = await db.read(User.Model, { _id: decoded.userId })
    return user
  } catch (error) {
    return null
  }
}

export const invalidateToken = async (token: string) => {
  await SessionManager.invalidateSession(token)
}

// User'ın tüm session'larını geçersiz kıl
export const invalidateAllUserSessions = async (userId: string) => {
  await SessionManager.invalidateAllUserSessions(userId)
}

// Session istatistikleri
export const getSessionStats = async () => {
  return await SessionManager.getSessionStats()
}

// User'ın aktif session sayısı
export const getUserSessionCount = async (userId: string) => {
  return await SessionManager.getUserSessionCount(userId)
}

// User'ın aktif session'ları
export const getUserSessions = async (userId: string) => {
  return await SessionManager.getUserSessions(userId)
}
