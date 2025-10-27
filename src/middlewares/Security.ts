import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'

/**
 * Security Headers Configuration
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Expect-CT (deprecated but still useful for older browsers)
  // expectCt: {
  //   maxAge: 86400,
  //   enforce: true,
  // },

  // Feature Policy (deprecated but still useful)
  // featurePolicy: {
  //   camera: ["'none'"],
  //   microphone: ["'none'"],
  //   geolocation: ["'none'"],
  //   payment: ["'none'"],
  //   usb: ["'none'"],
  //   magnetometer: ["'none'"],
  //   gyroscope: ["'none'"],
  //   speaker: ["'self'"],
  //   vibrate: ["'none'"],
  //   fullscreen: ["'self'"],
  //   syncXhr: ["'none'"],
  // },

  // Hide X-Powered-By
  hidePoweredBy: true,

  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permissions Policy
  // permissionsPolicy: {
  //   camera: [],
  //   microphone: [],
  //   geolocation: [],
  //   payment: [],
  //   usb: [],
  //   magnetometer: [],
  //   gyroscope: [],
  //   speaker: ['self'],
  //   vibrate: [],
  //   fullscreen: ['self'],
  //   syncXhr: [],
  // },

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // XSS Filter
  xssFilter: true,
})

/**
 * Rate Limiting Configurations
 */
export const rateLimitConfigs = {
  // Global rate limit
  global: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // Her IP için maksimum 100 istek
    message: {
      error: true,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Health check endpoint'lerini atla
      return req.path === '/health' || req.path === '/api/health'
    },
  }),

  // Auth endpoints için daha sıkı rate limiting
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Her IP için maksimum 5 login denemesi
    message: {
      error: true,
      message: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Başarılı istekleri sayma
  }),

  // API endpoints için orta seviye rate limiting
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 50, // Her IP için maksimum 50 API isteği
    message: {
      error: true,
      message: 'Too many API requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // File upload için özel rate limiting
  fileUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 10, // Her IP için maksimum 10 dosya yükleme
    message: {
      error: true,
      message: 'Too many file uploads, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Password reset için çok sıkı rate limiting
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 3, // Her IP için maksimum 3 şifre sıfırlama
    message: {
      error: true,
      message: 'Too many password reset attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
}

/**
 * IP Whitelist Middleware
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress

    if (clientIP && allowedIPs.includes(clientIP)) {
      next()
    } else {
      res.status(403).json({
        error: true,
        message: 'Access denied from this IP address.',
      })
    }
  }
}

/**
 * Request Size Limiter
 */
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0')
    const maxSizeBytes = parseInt(maxSize.replace('mb', '')) * 1024 * 1024

    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        error: true,
        message: `Request too large. Maximum size allowed: ${maxSize}`,
      })
    } else {
      next()
    }
  }
}

/**
 * Security Headers Middleware
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(self), vibrate=(), fullscreen=(self), sync-xhr=()',
  )

  // Remove server information
  res.removeHeader('X-Powered-By')

  next()
}

/**
 * Request Logging Middleware
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
  const userAgent = req.headers['user-agent'] || 'unknown'
  const timestamp = new Date().toISOString()

  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
    /javascript:/i, // JavaScript injection
  ]

  const requestBody = JSON.stringify(req.body)
  const requestUrl = req.url

  const isSuspicious = suspiciousPatterns.some(
    pattern => pattern.test(requestBody) || pattern.test(requestUrl),
  )

  if (isSuspicious) {
    console.warn(`🚨 Suspicious activity detected:`, {
      ip: clientIP,
      userAgent,
      url: requestUrl,
      body: requestBody,
      timestamp,
    })
  }

  next()
}

/**
 * CORS Security Configuration
 */
export const corsSecurity = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
}
