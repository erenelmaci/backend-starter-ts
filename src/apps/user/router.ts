/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
'use strict';

import { Router } from 'express';
import UserController from './controllers';

/* -------------------------------------------------- */

const router = Router();

// CRUD Routes
router.get('/', UserController.listMiddlewares, UserController.list);
router.post('/', UserController.createMiddlewares, UserController.create);
router.get('/:id', UserController.readMiddlewares, UserController.read);
router.put('/:id', UserController.updateMiddlewares, UserController.update);
router.delete('/:id', UserController.deleteMiddlewares, UserController.delete);

/* -------------------------------------------------- */
export default router;
