import request from 'supertest'
import { Express } from 'express'
import { CRUDTestGenerator } from '../utils/CRUDTestGenerator'
import { TestDataGenerator } from '../utils/TestDataGenerator'
import { testUtils } from '../utils/testSetup'
import User from '../../apps/user/model'

// Test app'i import et
let app: Express

// Test token'ları
let authToken: string
let adminToken: string

describe('User Model Tests', () => {
  beforeAll(async () => {
    // App'i import et
    app = require('../../index').default

    // Test token'ları oluştur
    authToken = testUtils.createTestToken('user123')
    adminToken = testUtils.createTestToken('admin123')
  })

  // User CRUD Tests
  const userTestData = TestDataGenerator.generateForModel(User.Model, 'User')

  const userCRUDTests = new CRUDTestGenerator(app, {
    model: User.Model,
    modelName: 'User',
    testData: userTestData,
    basePath: '/api/users',
    authToken,
    adminToken,
  })

  // Generate all test suites
  userCRUDTests.generateCRUDTests()
  userCRUDTests.generateValidationTests()
  userCRUDTests.generatePermissionTests()
  userCRUDTests.generatePerformanceTests()

  // Custom User-specific tests
  describe('User Specific Tests', () => {
    let createdUserId: string

    beforeEach(async () => {
      // Her test öncesi temiz user oluştur
      const mockUser = {
        email: testUtils.randomEmail(),
        firstName: 'Test',
        lastName: 'User',
        password: 'Test123!',
        role: 'user',
      }

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockUser)
        .expect(201)

      createdUserId = response.body._id
    })

    it('should hash password before saving', async () => {
      const response = await request(app)
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Password hash'lenmiş olmalı
      expect(response.body.password).not.toBe('Test123!')
      expect(response.body.password).toMatch(/^\$2[aby]\$\d+\$/)
    })

    it('should not return password in response', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Password field'ı response'da olmamalı
      response.body.data.forEach((user: any) => {
        expect(user.password).toBeUndefined()
      })
    })

    it('should validate unique email', async () => {
      const duplicateUser = {
        email: 'duplicate@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'Test123!',
        role: 'user',
      }

      // İlk user'ı oluştur
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateUser)
        .expect(201)

      // Aynı email ile ikinci user'ı oluşturmaya çalış
      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateUser)
        .expect(400) // Duplicate email error
    })

    it('should support user role validation', async () => {
      const invalidRoleUser = {
        email: testUtils.randomEmail(),
        firstName: 'Test',
        lastName: 'User',
        password: 'Test123!',
        role: 'invalid-role',
      }

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRoleUser)
        .expect(400)
    })

    it('should support user search by email', async () => {
      const response = await request(app)
        .get('/api/users?search=test@example.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should support user filtering by role', async () => {
      const response = await request(app)
        .get('/api/users?filter[role]=user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      response.body.data.forEach((user: any) => {
        expect(user.role).toBe('user')
      })
    })
  })
})
