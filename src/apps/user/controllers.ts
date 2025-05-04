import { Request, Response, NextFunction } from 'express'
import User from './model'
import { isUserHasPermission, isUserLogin } from '../../middlewares/Permissions'
import { db } from '../../database/Controller'
import encryptPassword from '../../helpers/encryptPassword'

export const user = {
  listMiddlewares: [],

  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.list(User.Model, req)
      view(res, 200, result)
    } catch (error) {
      next(error)
    }
  },
  createMiddlewares: [isUserLogin(), isUserHasPermission([global.ROLES.ADMIN, 'create'])],

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hashedPassword = encryptPassword(req.body.password)
      const userData = {
        ...req.body,
        password: hashedPassword,
      }
      const result = await db.create(User.Model, userData)
      view(res, 201, result)
    } catch (error) {
      next(error)
    }
  },
  readMiddlewares: [isUserLogin(), isUserHasPermission([global.ROLES.USER, 'read'])],

  read: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.read(User.Model, { _id: req.params.id })
      if (!result) {
        view(res, 404, { message: 'User not found' })
        return
      }
      view(res, 200, result)
    } catch (error) {
      next(error)
    }
  },

  updateMiddlewares: [isUserLogin(), isUserHasPermission([global.ROLES.USER, 'update'])],

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.update(User.Model, req.params.id, req.body)
      if (!result) {
        view(res, 404, { message: 'User not found' })
        return
      }
      view(res, 200, result as Record<string, any>)
    } catch (error) {
      next(error)
    }
  },

  deleteUserMiddlewares: [isUserLogin(), isUserHasPermission([global.ROLES.USER, 'delete'])],

  deleteUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.remove(User.Model, req.params.id)
      if (!result) {
        view(res, 404, { message: 'User not found' })
        return
      }
      view(res, 200, result as Record<string, any>)
    } catch (error) {
      next(error)
    }
  },
}
