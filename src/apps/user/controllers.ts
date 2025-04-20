/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
'use strict';
/* -------------------------------------------------- */

import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../database/BaseController';
import { IUser } from './model';
import User from './model';
import { isUserHasPermission, isUserLogin } from '../../middlewares/Permissions';
import { Types } from 'mongoose';

export default class UserController extends BaseController<IUser> {
  constructor() {
    super(User.Model);
  }

  // Middleware'ler
  public static listMiddlewares = [isUserLogin(), isUserHasPermission(['user', 'list'])];
  public static createMiddlewares = [isUserLogin(), isUserHasPermission(['user', 'create'])];
  public static readMiddlewares = [isUserLogin(), isUserHasPermission(['user', 'read'])];
  public static updateMiddlewares = [isUserLogin(), isUserHasPermission(['user', 'update'])];
  public static deleteMiddlewares = [isUserLogin(), isUserHasPermission(['user', 'delete'])];

  // Handler'lar
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await db.list(User.Model, req.query);
      view(res, 200, result);
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await db.create(User.Model, req.body);
      view(res, 201, result);
    } catch (error) {
      next(error);
    }
  }

  public static async read(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await db.read(User.Model, { _id: req.params.id });
      if (!result) {
        view(res, 404, { message: 'User not found' });
        return;
      }
      view(res, 200, result);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await db.update(User.Model, new Types.ObjectId(req.params.id), req.body);
      if (!result) {
        view(res, 404, { message: 'User not found' });
        return;
      }
      view(res, 200, result as Record<string, any>);
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await db.delete(User.Model, new Types.ObjectId(req.params.id));
      if (!result) {
        view(res, 404, { message: 'User not found' });
        return;
      }
      view(res, 200, result as Record<string, any>);
    } catch (error) {
      next(error);
    }
  }
}
