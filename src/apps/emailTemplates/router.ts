/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */

import { Router } from 'express'
import { emailTemplate } from './controller'

/* -------------------------------------------------- */

const router = Router()

// CRUD Routes
router.get('/', emailTemplate.listMiddlewares, emailTemplate.list)
router.get('/', emailTemplate.readMiddlewares, emailTemplate.read)
router.put('/:id', emailTemplate.updateMiddlewares, emailTemplate.update)

/* -------------------------------------------------- */
export default router
