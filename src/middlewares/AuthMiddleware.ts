import { Response, NextFunction } from 'express';
import { ExpressRequestInterface } from '../interface/ExpressRequestInterface';
import User, { IUser } from '../apps/user/model';
import { RedisUserModel } from '../cache/model/RedisUserModel';
import { db } from '../database/Controller';
import { validateToken } from '../services/AuthService';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const AuthMiddleware = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = (req.headers as any).authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = await validateToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    const user = await db.read(User.Model, { _id: decoded });
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    req.user = user as unknown as RedisUserModel;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Kimlik doğrulama hatası' });
  }
};
