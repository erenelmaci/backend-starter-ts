/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Router } from 'express'
import { rateLimitConfigs } from '../../middlewares/Security'
import auth from './controllers'

/* -------------------------------------------------- */

const router = Router()

// Auth endpoints için özel rate limiting
router.use(rateLimitConfigs.auth)

// Auth Routes
router.post('/login', auth.loginMiddlewares, auth.login)
router.post('/register', auth.registerMiddlewares, auth.register)
router.post('/logout', auth.logoutMiddlewares, auth.logout)
// router.get('/me', auth.me)
// router.post('/refresh-token', auth.refreshToken)
// router.post('/forgot-password', auth.forgotPassword)
// router.post('/reset-password', auth.resetPassword)
// router.post('/verify-email', auth.verifyEmail)
// router.post('/email-confirmation', auth.emailConfirmation)
// router.put('/update-password', auth.updatePassword)
// router.put('/update-profile-image', auth.updateProfileImage)
// router.get('/google', auth.googleAuth)
// router.get('/google/callback', auth.googleAuthCallback)
// router.get('/profile/update', auth.profileUpdate)
// router.get('/account-suspension', auth.accountSuspension)

/* -------------------------------------------------- */
export default router
