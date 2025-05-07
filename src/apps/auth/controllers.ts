/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Request, Response, NextFunction } from 'express'
import { db } from '../../database/Controller'
import User, { IUser } from '../user/model'
import encryptPassword from '../../helpers/encryptPassword'
import jwt from 'jsonwebtoken'

/* -------------------------------------------------- */

const auth = {
  loginMiddlewares: [],
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body
      const user = await db.read(User.Model, { email })
      if (!user) {
        view(res, 401, { message: 'Invalid email or password' })
        return
      }
      const isPasswordValid = encryptPassword(password) === (user as IUser).password
      if (!isPasswordValid) {
        view(res, 401, { message: 'Invalid email or password' })
        return
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' })
      view(res, 200, { token })
    } catch (error) {
      next(error)
    }
  },

  registerMiddlewares: [],
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as IUser
      const isExistingUser = await db.read(User.Model, { email: data.email })
      if (isExistingUser) {
        return view(res, 409, { message: 'This email is already registered.' })
      }

      data.password = encryptPassword(data.password)

      const newUser = await db.create(User.Model, data)

      return view(res, 201, {
        message: 'User registered successfully.',
        user: newUser,
      })
    } catch (error) {
      next(error)
    }
  },
}

export default auth
