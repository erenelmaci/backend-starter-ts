import jwt from 'jsonwebtoken'
import { redisConnection } from '../cache/redis-connection'
import User, { IUser } from '../apps/user/model'
import { db } from '../database/Controller'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined')
}

const JWT_SECRET = process.env.JWT_SECRET
const SESSION_EXPIRY = 24 * 60 * 60 // 24H
const redis = redisConnection.getClient()

export const generateToken = async (user: IUser) => {
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' },
  )

  await redis.setex(
    `auth:${token}`,
    SESSION_EXPIRY,
    JSON.stringify({
      userId: user._id,
      email: user.email,
      role: user.role,
    }),
  )

  return token
}

export const validateToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }

    const sessionData = await redis.get(`auth:${token}`)

    if (!sessionData) {
      return null
    }

    const user = await db.read(User.Model, { _id: decoded.userId })
    return user
  } catch (error) {
    return error
  }
}

export const invalidateToken = async (token: string) => {
  await redis.del(`auth:${token}`)
}
