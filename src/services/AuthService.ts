import jwt from 'jsonwebtoken';
import { redisConnection } from '../cache/redis-connection';
import { BaseController } from '../database/BaseController';
import User from '../apps/user/model';
import { IUser } from '../apps/user/model';
import { Redis } from 'ioredis';

export class AuthService extends BaseController<IUser> {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly SESSION_EXPIRY = 24 * 60 * 60; // 24 saat
  private redis: Redis;

  constructor() {
    super(User.Model);
    this.redis = redisConnection.getClient();
  }

  async generateToken(user: IUser) {
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      AuthService.JWT_SECRET,
      { expiresIn: '24h' },
    );

    // Redis'te session bilgisini sakla
    await this.redis.setex(
      `auth:${token}`,
      AuthService.SESSION_EXPIRY,
      JSON.stringify({
        userId: user._id,
        email: user.email,
        role: user.role,
      }),
    );

    return token;
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, AuthService.JWT_SECRET) as {
        userId: string;
        email: string;
      };

      // Redis'ten session bilgisini kontrol et
      const sessionData = await this.redis.get(`auth:${token}`);

      if (!sessionData) {
        return null;
      }

      // Kullanıcıyı veritabanından getir
      const user = await super.read({ _id: decoded.userId });
      return user;
    } catch (error) {
      return null;
    }
  }

  async invalidateToken(token: string) {
    await this.redis.del(`auth:${token}`);
  }
}
