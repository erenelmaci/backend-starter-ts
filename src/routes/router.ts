/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
/* -------------------------------------------------- */

import { Router } from 'express'
import userRouter from '../apps/user/router'
import emailTemplatesRouter from '../apps/emailTemplate/router'

const router = Router()

router.use('/users', userRouter)
router.use('/email-template', emailTemplatesRouter)

export default router
