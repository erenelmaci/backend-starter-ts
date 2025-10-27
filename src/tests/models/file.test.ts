import request from 'supertest'
import { Express } from 'express'
import { CRUDTestGenerator } from '../utils/CRUDTestGenerator'
import { TestDataGenerator } from '../utils/TestDataGenerator'
import { testUtils } from '../utils/testSetup'
import File from '../../apps/fileModule/model'

// Test app'i import et
let app: Express

// Test token'ları
let authToken: string
let adminToken: string

describe('File Model Tests', () => {
  beforeAll(async () => {
    // App'i import et
    app = require('../../index').default

    // Test token'ları oluştur
    authToken = testUtils.createTestToken('user123')
    adminToken = testUtils.createTestToken('admin123')
  })

  // File CRUD Tests
  const fileTestData = TestDataGenerator.generateForModel(File.Model, 'File')

  const fileCRUDTests = new CRUDTestGenerator(app, {
    model: File.Model,
    modelName: 'File',
    testData: fileTestData,
    basePath: '/api/files',
    authToken,
    adminToken,
  })

  // Generate all test suites
  fileCRUDTests.generateCRUDTests()
  fileCRUDTests.generateValidationTests()
  fileCRUDTests.generatePermissionTests()
  fileCRUDTests.generatePerformanceTests()

  // Custom File-specific tests
  describe('File Specific Tests', () => {
    let createdFileId: string

    beforeEach(async () => {
      // Her test öncesi temiz file oluştur
      const mockFile = {
        originalName: 'test-file.txt',
        fileName: 'test-file-123.txt',
        filePath: '/uploads/test-file-123.txt',
        mimeType: 'text/plain',
        size: 1024,
        model: 'User',
        modelId: '507f1f77bcf86cd799439011',
        uploadedBy: '507f1f77bcf86cd799439011',
        isActive: true,
      }

      const response = await request(app)
        .post('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockFile)
        .expect(201)

      createdFileId = response.body._id
    })

    it('should validate file size limits', async () => {
      const largeFile = {
        originalName: 'large-file.txt',
        fileName: 'large-file-123.txt',
        filePath: '/uploads/large-file-123.txt',
        mimeType: 'text/plain',
        size: 50 * 1024 * 1024, // 50MB
        model: 'User',
        modelId: '507f1f77bcf86cd799439011',
        uploadedBy: '507f1f77bcf86cd799439011',
        isActive: true,
      }

      await request(app)
        .post('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeFile)
        .expect(400) // File too large
    })

    it('should validate allowed file types', async () => {
      const invalidFileType = {
        originalName: 'test.exe',
        fileName: 'test-123.exe',
        filePath: '/uploads/test-123.exe',
        mimeType: 'application/x-executable',
        size: 1024,
        model: 'User',
        modelId: '507f1f77bcf86cd799439011',
        uploadedBy: '507f1f77bcf86cd799439011',
        isActive: true,
      }

      await request(app)
        .post('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFileType)
        .expect(400) // Invalid file type
    })

    it('should support file search by original name', async () => {
      const response = await request(app)
        .get('/api/files?search=test-file')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should support filtering by file type', async () => {
      const response = await request(app)
        .get('/api/files?filter[mimeType]=text/plain')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      response.body.data.forEach((file: any) => {
        expect(file.mimeType).toBe('text/plain')
      })
    })

    it('should support filtering by model', async () => {
      const response = await request(app)
        .get('/api/files?filter[model]=User')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.error).toBe(false)
      response.body.data.forEach((file: any) => {
        expect(file.model).toBe('User')
      })
    })
  })
})
