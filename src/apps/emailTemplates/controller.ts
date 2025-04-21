import { Request, Response, NextFunction } from 'express';
import EmailTemplate from './model';
import { isUserHasPermission, isUserLogin } from '../../middlewares/Permissions';
import { db } from '../../database/Controller';

export const emailTemplate = {
  listMiddlewares: [isUserLogin(), isUserHasPermission(['emailTemplate', 'list'])],

  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.list(EmailTemplate.Model, req.query);
      view(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  readMiddlewares: [isUserLogin(), isUserHasPermission(['emailTemplate', 'read'])],

  read: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.read(EmailTemplate.Model, { _id: req.params.id });
      if (!result) {
        view(res, 404, { message: 'Email template not found' });
        return;
      }
      view(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  updateMiddlewares: [isUserLogin(), isUserHasPermission(['emailTemplate', 'update'])],

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.update(EmailTemplate.Model, req.params.id, req.body);
      if (!result) {
        view(res, 404, { message: 'Email template not found' });
        return;
      }
      view(res, 200, result as Record<string, any>);
    } catch (error) {
      next(error);
    }
  },
};
