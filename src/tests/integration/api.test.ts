import request from 'supertest'
import { Express } from 'express'
import { testUtils } from '../utils/testSetup'

// Test app'i import et
let app: Express

// Test token'ları
let authToken: string
let adminToken: string

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // App'i import et
    app = require('../../index').default

    // Test token'ları oluştur
    authToken = testUtils.createTestToken('user123')
    adminToken = testUtils.createTestToken('admin123')
  })

  describe('Rate Limiting', () => {
    it('should enforce global rate limiting', async () => {
      // Çok fazla istek gönder
      const requests = Array.from({ length: 101 }, () =>
        request(app).get('/api/users').set('Authorization', `Bearer ${authToken}`),
      )

      const responses = await Promise.all(requests)

      // Son istekler rate limit'e takılmalı
      const lastResponse = responses[responses.length - 1]
      expect(lastResponse.status).toBe(429)
    })

    it('should enforce auth rate limiting', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      }

      // Çok fazla login denemesi
      const requests = Array.from({ length: 6 }, () =>
        request(app).post('/api/auth/login').send(loginData),
      )

      const responses = await Promise.all(requests)

      // Son istekler rate limit'e takılmalı
      const lastResponse = responses[responses.length - 1]
      expect(lastResponse.status).toBe(429)
    })
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Security headers kontrolü
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
      expect(response.headers['x-xss-protection']).toBe('1; mode=block')
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000')
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    })

    it('should detect suspicious activities', async () => {
      // XSS attempt
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: '<script>alert("xss")</script>',
          lastName: 'Test',
          email: 'test@example.com',
        })
        .expect(400)

      expect(response.body.error).toBe(true)
    })
  })

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization')
        .expect(200)

      expect(response.headers['access-control-allow-origin']).toBeDefined()
      expect(response.headers['access-control-allow-methods']).toContain('POST')
      expect(response.headers['access-control-allow-headers']).toContain('Authorization')
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe(true)
      expect(response.body.message).toBeDefined()
    })

    it('should handle 500 errors gracefully', async () => {
      // Invalid ObjectId ile istek
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.error).toBe(true)
    })
  })

  describe('Swagger Documentation', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app).get('/api-docs/').expect(200)

      expect(response.text).toContain('Swagger UI')
    })

    it('should serve Swagger JSON', async () => {
      const response = await request(app).get('/api-docs/swagger.json').expect(200)

      expect(response.body.openapi).toBeDefined()
      expect(response.body.paths).toBeDefined()
      expect(response.body.components).toBeDefined()
    })
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200)

      expect(response.body.status).toBe('OK')
      expect(response.body.timestamp).toBeDefined()
    })
  })
})
