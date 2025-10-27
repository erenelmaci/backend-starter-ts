import request from 'supertest'
import { Express } from 'express'
import { testUtils } from '../utils/testSetup'

// Test app'i import et
let app: Express

// Test token'ları
let authToken: string
let adminToken: string

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // App'i import et
    app = require('../../index').default

    // Test token'ları oluştur
    authToken = testUtils.createTestToken('user123')
    adminToken = testUtils.createTestToken('admin123')
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!',
      }

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200)

      expect(response.body.error).toBe(false)
      expect(response.body.token).toBeDefined()
      expect(response.body.message).toBe('Login successful')
    })

    it('should return 401 with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      }

      const response = await request(app).post('/api/auth/login').send(loginData).expect(401)

      expect(response.body.error).toBe(true)
    })

    it('should set secure cookie on login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!',
      }

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200)

      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('token=')
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly')
      expect(response.headers['set-cookie'][0]).toContain('Secure')
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const registerData = {
        email: testUtils.randomEmail(),
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      }

      const response = await request(app).post('/api/auth/register').send(registerData).expect(201)

      expect(response.body.error).toBe(false)
      expect(response.body.message).toBe('User registered successfully.')
      expect(response.body.user).toBeDefined()
      expect(response.body.token).toBeDefined()
    })

    it('should return 400 for duplicate email', async () => {
      const registerData = {
        email: 'duplicate@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      }

      // İlk kayıt
      await request(app).post('/api/auth/register').send(registerData).expect(201)

      // İkinci kayıt (duplicate email)
      const response = await request(app).post('/api/auth/register').send(registerData).expect(400)

      expect(response.body.error).toBe(true)
    })

    it('should hash password before saving', async () => {
      const registerData = {
        email: testUtils.randomEmail(),
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      }

      const response = await request(app).post('/api/auth/register').send(registerData).expect(201)

      // Password hash'lenmiş olmalı
      expect(response.body.user.password).not.toBe('Test123!')
      expect(response.body.user.password).toMatch(/^\$2[aby]\$\d+\$/)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      expect(response.body.message).toBe('Logout successful')
    })

    it('should clear cookie on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.headers['set-cookie']).toBeDefined()
      expect(response.headers['set-cookie'][0]).toContain('token=;')
    })
  })

  describe('Session Management', () => {
    it('should track user sessions', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!',
      }

      // Login
      const loginResponse = await request(app).post('/api/auth/login').send(loginData).expect(200)

      const _token = loginResponse.body.token

      // Session stats kontrolü
      const statsResponse = await request(app)
        .get('/api/sessions/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(statsResponse.body.totalSessions).toBeGreaterThan(0)
      expect(statsResponse.body.activeUsers).toBeGreaterThan(0)
    })

    it('should detect session hijacking', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!',
      }

      // Login
      const loginResponse = await request(app).post('/api/auth/login').send(loginData).expect(200)

      const token = loginResponse.body.token

      // Farklı User-Agent ile istek
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .set('User-Agent', 'Different-Browser/1.0')
        .expect(401) // Session hijacking detected

      expect(response.body.message).toContain('Geçersiz token')
    })
  })
})
