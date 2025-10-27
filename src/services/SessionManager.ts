/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 * Session Management Service
 ******************************************************* */

import { redisConnection } from '../cache/redis-connection'

interface SessionData {
  userId: string
  email: string
  role: string
  userAgent: string
  ip: string
  createdAt: string
  lastActivity: string
  isActive: boolean
}

export class SessionManager {
  private static readonly SESSION_PREFIX = 'auth:'
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:'
  private static readonly SESSION_EXPIRY = 24 * 60 * 60 // 24 saat

  private static getRedisClient() {
    if (!redisConnection.isRedisConnected()) {
      throw new Error('Redis connection is not available')
    }
    return redisConnection.getClient()
  }

  /**
   * Session oluşturur ve Redis'e kaydeder
   */
  public static async createSession(token: string, sessionData: SessionData): Promise<void> {
    try {
      const redis = this.getRedisClient()

      // Session'ı Redis'e kaydet
      await redis.setex(
        `${this.SESSION_PREFIX}${token}`,
        this.SESSION_EXPIRY,
        JSON.stringify(sessionData),
      )

      // User'ın aktif session'larını takip et
      await redis.sadd(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, token)
      await redis.expire(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, this.SESSION_EXPIRY)

      console.log(`Session created for user ${sessionData.userId}`)
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  /**
   * Session'ı Redis'den okur ve doğrular
   */
  public static async getSession(token: string): Promise<SessionData | null> {
    try {
      const redis = this.getRedisClient()
      const sessionData = await redis.get(`${this.SESSION_PREFIX}${token}`)

      if (!sessionData) {
        return null
      }

      return JSON.parse(sessionData) as SessionData
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  /**
   * Session'ı günceller (lastActivity)
   */
  public static async updateSession(token: string, sessionData: SessionData): Promise<void> {
    try {
      const redis = this.getRedisClient()

      // Session'ı güncelle
      await redis.setex(
        `${this.SESSION_PREFIX}${token}`,
        this.SESSION_EXPIRY,
        JSON.stringify(sessionData),
      )
    } catch (error) {
      console.error('Error updating session:', error)
      throw error
    }
  }

  /**
   * Session'ı geçersiz kılar
   */
  public static async invalidateSession(token: string): Promise<void> {
    try {
      const redis = this.getRedisClient()

      // Session'ı Redis'den sil
      await redis.del(`${this.SESSION_PREFIX}${token}`)

      // Session'dan user ID'yi al
      const sessionData = await this.getSession(token)
      if (sessionData) {
        // User'ın session listesinden de sil
        await redis.srem(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, token)
      }
    } catch (error) {
      console.error('Error invalidating session:', error)
      throw error
    }
  }

  /**
   * User'ın tüm session'larını geçersiz kılar
   */
  public static async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      const redis = this.getRedisClient()
      const sessions = await redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`)

      // Tüm session'ları sil
      for (const sessionToken of sessions) {
        await redis.del(`${this.SESSION_PREFIX}${sessionToken}`)
      }

      // User session listesini sil
      await redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`)

      console.log(`All sessions invalidated for user ${userId}`)
    } catch (error) {
      console.error('Error invalidating all user sessions:', error)
      throw error
    }
  }

  /**
   * User'ın aktif session sayısını döndürür
   */
  public static async getUserSessionCount(userId: string): Promise<number> {
    try {
      const redis = this.getRedisClient()
      return await redis.scard(`${this.USER_SESSIONS_PREFIX}${userId}`)
    } catch (error) {
      console.error('Error getting user session count:', error)
      return 0
    }
  }

  /**
   * User'ın aktif session'larını listeler
   */
  public static async getUserSessions(userId: string): Promise<string[]> {
    try {
      const redis = this.getRedisClient()
      return await redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`)
    } catch (error) {
      console.error('Error getting user sessions:', error)
      return []
    }
  }

  /**
   * Session hijacking kontrolü
   */
  public static async validateSessionSecurity(
    token: string,
    userAgent?: string,
    ip?: string,
  ): Promise<boolean> {
    try {
      const session = await this.getSession(token)
      if (!session) {
        return false
      }

      // User-Agent kontrolü
      if (userAgent && session.userAgent !== userAgent) {
        console.warn(`Session hijacking attempt detected for user ${session.userId}`)
        await this.invalidateSession(token)
        return false
      }

      // IP kontrolü (opsiyonel)
      if (ip && session.ip !== ip && session.ip !== 'unknown') {
        console.warn(`IP mismatch detected for user ${session.userId}`)
        // IP değişikliği sadece uyarı, session'ı geçersiz kılmıyoruz
      }

      return true
    } catch (error) {
      console.error('Error validating session security:', error)
      return false
    }
  }

  /**
   * Session'ı yeniler (expiry süresini uzatır)
   */
  public static async refreshSession(token: string): Promise<void> {
    try {
      const session = await this.getSession(token)
      if (!session) {
        throw new Error('Session not found')
      }

      // Son aktiviteyi güncelle
      session.lastActivity = new Date().toISOString()

      // Session'ı yenile
      await this.updateSession(token, session)
    } catch (error) {
      console.error('Error refreshing session:', error)
      throw error
    }
  }

  /**
   * Redis bağlantı durumunu kontrol eder
   */
  public static isRedisAvailable(): boolean {
    return redisConnection.isRedisConnected()
  }

  /**
   * Session istatistiklerini döndürür
   */
  public static async getSessionStats(): Promise<{
    totalSessions: number
    activeUsers: number
    redisConnected: boolean
  }> {
    try {
      const redis = this.getRedisClient()

      // Toplam session sayısı
      const keys = await redis.keys(`${this.SESSION_PREFIX}*`)
      const totalSessions = keys.length

      // Aktif user sayısı
      const userKeys = await redis.keys(`${this.USER_SESSIONS_PREFIX}*`)
      const activeUsers = userKeys.length

      return {
        totalSessions,
        activeUsers,
        redisConnected: this.isRedisAvailable(),
      }
    } catch (error) {
      console.error('Error getting session stats:', error)
      return {
        totalSessions: 0,
        activeUsers: 0,
        redisConnected: false,
      }
    }
  }
}
