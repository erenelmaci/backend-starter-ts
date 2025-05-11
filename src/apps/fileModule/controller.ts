import { NextFunction, Request, Response } from 'express'
import CONSTANTS from '../../config/constants'
import { isUserHasPermission, isUserLogin } from '../../middlewares/Permissions'
import File from './model'
import { db } from '../../database/Controller'

export const fileModule = {
  listMiddlewares: [isUserLogin(), isUserHasPermission([CONSTANTS.USER_ROLES.ADMIN, 'read'])],
  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.list(File.Model, req)
      view(res, 200, { message: 'Files listed successfully', data: result })
    } catch (error) {
      next(error)
    }
  },

  readMiddlewares: [isUserLogin(), isUserHasPermission([CONSTANTS.USER_ROLES.ADMIN, 'read'])],
  read: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.model || !req.params.modelId) {
        view(res, 400, { message: 'Both model and modelId parameters are required' })
        return
      }
      const result = await db.read(File.Model, {
        model: req.params.model,
        modelId: req.params.modelId,
      })
      view(res, 200, { message: 'File details fetched successfully', data: result })
    } catch (error) {
      next(error)
    }
  },

  removeByIdMiddlewares: [
    isUserLogin(),
    isUserHasPermission([CONSTANTS.USER_ROLES.ADMIN, 'delete']),
  ],
  removeById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params._id) {
        view(res, 400, { message: '_id parameter is required' })
        return
      }
      const result = await db.remove(File.Model, { _id: req.params._id })
      view(res, 200, { message: 'File removed successfully by ID', data: result })
    } catch (error) {
      next(error)
    }
  },

  removeByModelAndIdMiddlewares: [
    isUserLogin(),
    isUserHasPermission([CONSTANTS.USER_ROLES.ADMIN, 'delete']),
  ],
  removeByModelAndId: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.params.model || !req.params.modelId) {
        view(res, 400, { message: 'Both model and modelId parameters are required' })
        return
      }
      const result = await db.remove(File.Model, {
        model: req.params.model,
        modelId: req.params.modelId,
      })
      view(res, 200, { message: 'File removed successfully by model and ID', data: result })
    } catch (error) {
      next(error)
    }
  },
}
