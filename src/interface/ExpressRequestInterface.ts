import { Request } from 'express'
import { IUser } from '../apps/user/model'

export interface ExpressRequestInterface extends Request {
  user?: IUser
}
