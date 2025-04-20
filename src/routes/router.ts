/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */
'use strict';
/* -------------------------------------------------- */

import { Router } from 'express';
import userRouter from '../apps/user/router';

const router = Router();

router.use('/users', userRouter);

export default router;
