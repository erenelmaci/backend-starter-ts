/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import express, { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

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
import middlewares from './middlewares/index'
import ErrorHandler from './middlewares/errorHandler'
import routes from './routes'
import { setupSwagger } from './config/swagger'
import resetToTestData from './tests/reset-to-db'

const app = express()

app.use(express.json())

app.set('env', process.env.ENV)
app.disable('x-powered-by')

connectToMongoDB()

// CORS settings
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
    }),
  )
} else {
  app.use(cors())
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
