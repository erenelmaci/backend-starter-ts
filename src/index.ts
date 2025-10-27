/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import express, { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {
  securityHeaders,
  rateLimitConfigs,
  customSecurityHeaders,
  securityLogger,
  corsSecurity,
} from './middlewares/Security'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
})

console.log('\x1b[32m%s\x1b[0m', 'Environment:', process.env.NODE_ENV)
console.log(
  '\x1b[32m%s\x1b[0m',
  'ENV File:',
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
)

import './config/globals'
import { connectToMongoDB } from './database/mongodb'
import { redisConnection } from './cache/redis-connection'
import { rabbitMQManager } from './queue/amqp-connection'
import { cronjobManager, CLEANUP_JOBS } from './jobs/baseJob'
import {
  emailQueueService,
  notificationQueueService,
  fileProcessingQueueService,
} from './services/QueueService'
import middlewares from './middlewares/index'
import ErrorHandler from './middlewares/errorHandler'
import routes from './routes'
import { setupSwagger } from './config/swagger'
import resetToTestData from './tests/reset-to-db'

const app = express()

// Security middleware'leri
app.use(securityHeaders)
app.use(customSecurityHeaders)
app.use(securityLogger)

// Global rate limiting
app.use(rateLimitConfigs.global)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.set('env', process.env.ENV)
app.disable('x-powered-by')

// Database connections
connectToMongoDB()
redisConnection.connect().catch(console.error)

// Queue connections
rabbitMQManager.connect().catch(console.error)

// Initialize cronjobs
const initializeCronjobs = async () => {
  try {
    // User cleanup job - 30 gün sonra inactive, 60 gün sonra soft delete, 90 gün sonra hard delete
    cronjobManager.addCleanupJob(CLEANUP_JOBS.USER_CLEANUP, {
      model: require('./apps/user/model').default.Model,
      loginField: 'lastLoginAt',
      stages: {
        markAsInactive: 30 * 24 * 60 * 60 * 1000, // 30 gün
        softDelete: 60 * 24 * 60 * 60 * 1000, // 60 gün
        hardDelete: 90 * 24 * 60 * 60 * 1000, // 90 gün
      },
    })

    // Session cleanup job - 24 saat sonra hard delete
    cronjobManager.addCleanupJob(CLEANUP_JOBS.SESSION_CLEANUP, {
      model: require('./apps/user/model').default.Model,
      loginField: 'lastActivity',
      stages: {
        hardDelete: 24 * 60 * 60 * 1000, // 24 saat
      },
    })

    // File cleanup job - 7 gün sonra soft delete, 30 gün sonra hard delete
    cronjobManager.addCleanupJob(CLEANUP_JOBS.FILE_CLEANUP, {
      model: require('./apps/fileModule/model').default.Model,
      deletedAtBased: true,
      stages: {
        hardDelete: 30 * 24 * 60 * 60 * 1000, // 30 gün
      },
    })

    // Schedule jobs
    cronjobManager.scheduleJob(CLEANUP_JOBS.USER_CLEANUP, 24 * 60 * 60 * 1000) // Her gün
    cronjobManager.scheduleJob(CLEANUP_JOBS.SESSION_CLEANUP, 60 * 60 * 1000) // Her saat
    cronjobManager.scheduleJob(CLEANUP_JOBS.FILE_CLEANUP, 24 * 60 * 60 * 1000) // Her gün

    console.log('✅ Cronjobs initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing cronjobs:', error)
  }
}

// Initialize cronjobs after connections
setTimeout(initializeCronjobs, 5000) // 5 saniye bekle

// CORS settings with security
if (process.env.ORIGIN && process.env.ORIGIN.length >= 4) {
  const origins = process.env.ORIGIN.replace(/\s*/g, '')
    .split(',')
    .flatMap(domain => [
      `http://${domain}`,
      `http://*.${domain}`,
      `https://${domain}`,
      `https://*.${domain}`,
    ])

  app.use(
    cors({
      origin: origins,
      methods: 'GET, POST, PUT, PATCH, DELETE',
      credentials: true,
    }),
  )
} else {
  app.use(cors(corsSecurity))
}

app.use(express.urlencoded({ extended: true }))

// Middlewares
app.use(middlewares)

// Routes
app.use(routes)

// Crons
// import './tasks';

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  ErrorHandler(err, req, res, next)
})

setupSwagger(app)

// Server Start
const PORT = process.env.PORT || 3000
const API_URL = process.env.API_URL || ''
app.listen(PORT, () => {
  console.log(
    '\x1b[32m%s\x1b[0m',
    `Server running at http://localhost:${PORT}${API_URL} | PID:${process.pid}`,
  )
})

// Cron endpoint
// app.get('/cron-job', cronJob);

// db reset
app.get('/db-reset-34caRwZcR32kicFYEkIhhM4g9LDSwjQk', resetToTestData)
