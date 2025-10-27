/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */
/* -------------------------------------------------- */

import { Router } from 'express'
import userRouter from '../apps/user/router'
import emailTemplatesRouter from '../apps/emailTemplate/router'
import authRouter from '../apps/auth/router'
import sessionRouter from '../apps/session/router'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/email-template', emailTemplatesRouter)
router.use('/sessions', sessionRouter)

export default router
