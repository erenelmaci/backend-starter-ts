/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Router } from 'express'
import { user } from './controllers'

/* -------------------------------------------------- */

const router = Router()

// CRUD Routes
router.get('/', user.listMiddlewares, user.list)
router.post('/', user.createMiddlewares, user.create)
router.get('/:id', user.readMiddlewares, user.read)
router.put('/:id', user.updateMiddlewares, user.update)
router.delete('/:id', user.deleteUserMiddlewares, user.deleteUser)

/* -------------------------------------------------- */
export default router
