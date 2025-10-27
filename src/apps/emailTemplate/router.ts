/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Router } from 'express'
import { emailTemplate } from './controller'

/* -------------------------------------------------- */

const router = Router()

// CRUD Routes
router.get('/', emailTemplate.listMiddlewares, emailTemplate.list)
router.post('/', emailTemplate.createMiddlewares, emailTemplate.create)
router.get('/:id', emailTemplate.readMiddlewares, emailTemplate.read)
router.put('/:id', emailTemplate.updateMiddlewares, emailTemplate.update)
router.delete('/:id', emailTemplate.deleteMiddlewares, emailTemplate.delete)

/* -------------------------------------------------- */
export default router
