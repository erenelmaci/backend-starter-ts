import CONSTANTS from '../../config/constants'

export interface IRedisUserModel {
  id: string
  role: typeof CONSTANTS.USER_ROLES
  email: string
  firstName: string
  lastName: string
  profileImage?: string
}

export class RedisUserModel {
  constructor(
    public id: string,
    public role: typeof CONSTANTS.USER_ROLES,
    public email: string,
    public firstName: string,
    public lastName: string,
    public profileImage?: string,
  ) {}
}
