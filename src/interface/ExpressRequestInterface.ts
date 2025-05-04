import { RedisUserModel } from '../cache/model/RedisUserModel'

export interface ExpressRequestInterface extends Request {
  user?: RedisUserModel
}
