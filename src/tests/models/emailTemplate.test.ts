import request from 'supertest'
import { Express } from 'express'
import { CRUDTestGenerator } from '../utils/CRUDTestGenerator'
import { TestDataGenerator } from '../utils/TestDataGenerator'
import { testUtils } from '../utils/testSetup'
import EmailTemplate from '../../apps/emailTemplate/model'

// Test app'i import et
let app: Express

// Test token'ları
let authToken: string
let adminToken: string

describe('EmailTemplate Model Tests', () => {
  beforeAll(async () => {
    // App'i import et
    app = require('../../index').default

    // Test token'ları oluştur
    authToken = testUtils.createTestToken('user123')
    adminToken = testUtils.createTestToken('admin123')
  })

  // EmailTemplate CRUD Tests
  const emailTemplateTestData = TestDataGenerator.generateForModel(
    EmailTemplate.Model,
    'EmailTemplate',
  )

  const emailTemplateCRUDTests = new CRUDTestGenerator(app, {
    model: EmailTemplate.Model,
    modelName: 'EmailTemplate',
    testData: emailTemplateTestData,
    basePath: '/api/email-template',
    authToken,
    adminToken,
  })

  // Generate all test suites
  emailTemplateCRUDTests.generateCRUDTests()
  emailTemplateCRUDTests.generateValidationTests()
  emailTemplateCRUDTests.generatePermissionTests()
  emailTemplateCRUDTests.generatePerformanceTests()

  // Custom EmailTemplate-specific tests
  describe('EmailTemplate Specific Tests', () => {
    let createdTemplateId: string

    beforeEach(async () => {
      // Her test öncesi temiz template oluştur
      const mockTemplate = {
        name: `Test Template ${testUtils.randomString()}`,
        subject: 'Test Subject',
        content: 'Test Content {{name}}',
        variables: ['name', 'email'],
        isActive: true,
      }

      const response = await request(app)
        .post('/api/email-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockTemplate)
        .expect(201)

      createdTemplateId = response.body._id
    })

    it('should validate template variables', async () => {
      const templateWithInvalidVars = {
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test Content {{invalidVar}}',
        variables: ['name'], // invalidVar tanımlı değil
        isActive: true,
      }

      await request(app)
        .post('/api/email-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateWithInvalidVars)
        .expect(400)
    })

    it('should support template variable substitution', async () => {
      const response = await request(app)
        .get(`/api/email-template/${createdTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.content).toContain('{{name}}')
      expect(response.body.variables).toContain('name')
    })

    it('should validate unique template names', async () => {
      const duplicateTemplate = {
        name: 'Duplicate Template',
        subject: 'Test Subject',
        content: 'Test Content',
        variables: [],
        isActive: true,
      }

      // İlk template'i oluştur
      await request(app)
        .post('/api/email-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateTemplate)
        .expect(201)

      // Aynı isimle ikinci template'i oluşturmaya çalış
      await request(app)
        .post('/api/email-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateTemplate)
        .expect(400) // Duplicate name error
    })

    it('should support template search by name', async () => {
      const response = await request(app)
        .get('/api/email-template?search=Test Template')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should support filtering by active status', async () => {
      const response = await request(app)
        .get('/api/email-template?filter[isActive]=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      response.body.data.forEach((template: any) => {
        expect(template.isActive).toBe(true)
      })
    })
  })
})
