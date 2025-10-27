/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Request, Response, NextFunction } from 'express'
import { db } from '../../database/Controller'
import User, { IUser } from '../user/model'
import encryptPassword from '../../helpers/encryptPassword'
import { generateToken, invalidateToken } from '../../services/AuthService'

/* -------------------------------------------------- */

const auth = {
  loginMiddlewares: [],
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body
      const user = await db.read(User.Model, { email })
      if (!user) {
        view(res, 401, { message: 'Invalid email or password' })
        return
      }
      const isPasswordValid = encryptPassword(password) === (user as IUser).password
      if (!isPasswordValid) {
        view(res, 401, { message: 'Invalid email or password' })
        return
      }
      const userAgent = req.headers['user-agent'] || 'unknown'
      const ip = req.ip || req.connection.remoteAddress || 'unknown'
      const token = await generateToken(user as IUser, userAgent, ip)
      // Güvenli cookie ayarları
      const cookieOptions = {
        httpOnly: true, // XSS koruması
        secure: process.env.NODE_ENV === 'production', // HTTPS'de çalışır
        sameSite: 'strict' as const, // CSRF koruması
        maxAge: 24 * 60 * 60 * 1000, // 24 saat
        path: '/',
      }
      res.cookie('token', token, cookieOptions)
      view(res, 200, { token, message: 'Login successful' })
    } catch (error) {
      next(error)
    }
  },

  registerMiddlewares: [],
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body as IUser
      const isExistingUser = await db.read(User.Model, { email: data.email })
      if (isExistingUser) {
        view(res, 409, { message: 'This email is already registered.' })
        return
      }

      data.password = encryptPassword(data.password)

      const newUser = await db.create(User.Model, data)
      const userAgent = req.headers['user-agent'] || 'unknown'
      const ip = req.ip || req.connection.remoteAddress || 'unknown'
      const token = await generateToken(data, userAgent, ip)

      // Güvenli cookie ayarları
      const cookieOptions = {
        httpOnly: true, // XSS koruması
        secure: process.env.NODE_ENV === 'production', // HTTPS'de çalışır
        sameSite: 'strict' as const, // CSRF koruması
        maxAge: 24 * 60 * 60 * 1000, // 24 saat
        path: '/',
      }

      res.cookie('token', token, cookieOptions)
      view(res, 201, {
        message: 'User registered successfully.',
        user: newUser,
        token,
      })
    } catch (error) {
      next(error)
    }
  },

  logoutMiddlewares: [],
  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const headerToken = (req.headers as any).authorization?.split(' ')[1]
      const cookieToken = req.cookies?.token
      const token = headerToken || cookieToken

      if (token) {
        await invalidateToken(token)
      }

      // Cookie'yi temizle
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      view(res, 200, { message: 'Logout successful' })
    } catch (error) {
      next(error)
    }
  },
}

export default auth
