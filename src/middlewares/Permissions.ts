/* *******************************************************
 * NODEJS PROJECT © 2024 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
/* -------------------------------------------------- */

import { NextFunction, Request, Response } from 'express';
import { SendError } from '../helpers/errorHandler';

export default class Permissions {
  public static isUserLogin() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new SendError('AUTH_BLANK_DATA');
      }
      next();
    };
  }

  public static isUserHasPermission(permissions: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new SendError('AUTH_NO_PERMISSION');
      }

      const hasPermission = permissions.every(permission =>
        (req.user as any)?.permissions?.includes(permission),
      );

      if (!hasPermission) {
        throw new SendError('AUTH_NO_PERMISSION');
      }

      next();
    };
  }
}

/* -------------------------------------------------- */

export const { isUserLogin, isUserHasPermission } = Permissions;
