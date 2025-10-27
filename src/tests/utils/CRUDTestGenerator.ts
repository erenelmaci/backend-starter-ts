import { Model } from 'mongoose'
import { IBaseDocument } from '../../database/Model'
import { db } from '../../database/Controller'
import request from 'supertest'
import { Express } from 'express'

interface TestData {
  valid: any
  invalid: any
  update: any
}

interface CRUDTestOptions {
  model: Model<any>
  modelName: string
  testData: TestData
  basePath: string
  authToken?: string
  adminToken?: string
}

export class CRUDTestGenerator {
  private app: Express
  private model: Model<any>
  private modelName: string
  private testData: TestData
  private basePath: string
  private authToken?: string
  private adminToken?: string

  constructor(app: Express, options: CRUDTestOptions) {
    this.app = app
    this.model = options.model
    this.modelName = options.modelName
    this.testData = options.testData
    this.basePath = options.basePath
    this.authToken = options.authToken
    this.adminToken = options.adminToken
  }

  /**
   * Otomatik CRUD testlerini oluşturur
   */
  public generateCRUDTests(): void {
    describe(`${this.modelName} CRUD Operations`, () => {
      let createdId: string

      describe('POST / (Create)', () => {
        it('should create a new record with valid data', async () => {
          const response = await request(this.app)
            .post(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(this.testData.valid)
            .expect(201)

          expect(response.body.error).toBe(false)
          expect(response.body._id).toBeDefined()
          createdId = response.body._id
        })

        it('should return 400 for invalid data', async () => {
          const response = await request(this.app)
            .post(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(this.testData.invalid)
            .expect(400)

          expect(response.body.error).toBe(true)
        })

        it('should return 401 without authentication', async () => {
          await request(this.app).post(this.basePath).send(this.testData.valid).expect(401)
        })
      })

      describe('GET / (List)', () => {
        it('should return list of records', async () => {
          const response = await request(this.app)
            .get(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
          expect(Array.isArray(response.body.data)).toBe(true)
        })

        it('should support pagination', async () => {
          const response = await request(this.app)
            .get(`${this.basePath}?page=1&limit=10`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
          expect(response.body.pagination).toBeDefined()
        })

        it('should support filtering', async () => {
          const response = await request(this.app)
            .get(`${this.basePath}?filter[isActive]=true`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
        })

        it('should support sorting', async () => {
          const response = await request(this.app)
            .get(`${this.basePath}?sort=createdAt`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
        })
      })

      describe('GET /:id (Read)', () => {
        it('should return a specific record', async () => {
          const response = await request(this.app)
            .get(`${this.basePath}/${createdId}`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
          expect(response.body._id).toBe(createdId)
        })

        it('should return 404 for non-existent record', async () => {
          await request(this.app)
            .get(`${this.basePath}/507f1f77bcf86cd799439011`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(404)
        })

        it('should return 401 without authentication', async () => {
          await request(this.app).get(`${this.basePath}/${createdId}`).expect(401)
        })
      })

      describe('PUT /:id (Update)', () => {
        it('should update a record', async () => {
          const response = await request(this.app)
            .put(`${this.basePath}/${createdId}`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(this.testData.update)
            .expect(200)

          expect(response.body.error).toBe(false)
          expect(response.body._id).toBe(createdId)
        })

        it('should return 404 for non-existent record', async () => {
          await request(this.app)
            .put(`${this.basePath}/507f1f77bcf86cd799439011`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(this.testData.update)
            .expect(404)
        })

        it('should return 401 without authentication', async () => {
          await request(this.app)
            .put(`${this.basePath}/${createdId}`)
            .send(this.testData.update)
            .expect(401)
        })
      })

      describe('DELETE /:id (Delete)', () => {
        it('should soft delete a record', async () => {
          const response = await request(this.app)
            .delete(`${this.basePath}/${createdId}`)
            .set('Authorization', `Bearer ${this.adminToken || this.authToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
        })

        it('should return 404 for non-existent record', async () => {
          await request(this.app)
            .delete(`${this.basePath}/507f1f77bcf86cd799439011`)
            .set('Authorization', `Bearer ${this.adminToken || this.authToken}`)
            .expect(404)
        })

        it('should return 401 without authentication', async () => {
          await request(this.app).delete(`${this.basePath}/${createdId}`).expect(401)
        })
      })
    })
  }

  /**
   * Model field'larına göre validation testleri oluşturur
   */
  public generateValidationTests(): void {
    describe(`${this.modelName} Validation Tests`, () => {
      const requiredFields = this.getRequiredFields()

      requiredFields.forEach(field => {
        it(`should require ${field} field`, async () => {
          const invalidData = { ...this.testData.valid }
          delete invalidData[field]

          await request(this.app)
            .post(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(invalidData)
            .expect(400)
        })
      })

      it('should validate email format for email fields', async () => {
        const emailFields = this.getEmailFields()
        for (const field of emailFields) {
          const invalidData = { ...this.testData.valid }
          invalidData[field] = 'invalid-email'

          await request(this.app)
            .post(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(invalidData)
            .expect(400)
        }
      })

      it('should validate phone format for phone fields', async () => {
        const phoneFields = this.getPhoneFields()
        for (const field of phoneFields) {
          const invalidData = { ...this.testData.valid }
          invalidData[field] = 'invalid-phone'

          await request(this.app)
            .post(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(invalidData)
            .expect(400)
        }
      })
    })
  }

  /**
   * Permission testleri oluşturur
   */
  public generatePermissionTests(): void {
    describe(`${this.modelName} Permission Tests`, () => {
      it('should require authentication for all operations', async () => {
        await request(this.app).get(this.basePath).expect(401)

        await request(this.app).post(this.basePath).send(this.testData.valid).expect(401)
      })

      it('should require proper permissions for delete operation', async () => {
        const response = await request(this.app)
          .post(this.basePath)
          .set('Authorization', `Bearer ${this.authToken}`)
          .send(this.testData.valid)
          .expect(201)

        const createdId = response.body._id

        // Normal user should not be able to delete (if admin required)
        if (this.adminToken) {
          await request(this.app)
            .delete(`${this.basePath}/${createdId}`)
            .set('Authorization', `Bearer ${this.authToken}`)
            .expect(403)
        }
      })

      it('should allow admin to perform all operations', async () => {
        if (this.adminToken) {
          const response = await request(this.app)
            .get(this.basePath)
            .set('Authorization', `Bearer ${this.adminToken}`)
            .expect(200)

          expect(response.body.error).toBe(false)
        }
      })
    })
  }

  /**
   * Performance testleri oluşturur
   */
  public generatePerformanceTests(): void {
    describe(`${this.modelName} Performance Tests`, () => {
      it('should handle bulk operations efficiently', async () => {
        const startTime = Date.now()

        const bulkData = Array.from({ length: 10 }, (_, i) => ({
          ...this.testData.valid,
          email: `test${i}@example.com`,
        }))

        for (const data of bulkData) {
          await request(this.app)
            .post(this.basePath)
            .set('Authorization', `Bearer ${this.authToken}`)
            .send(data)
            .expect(201)
        }

        const endTime = Date.now()
        const duration = endTime - startTime

        // Bulk operations should complete within reasonable time
        expect(duration).toBeLessThan(5000) // 5 seconds
      })

      it('should handle large dataset pagination', async () => {
        const response = await request(this.app)
          .get(`${this.basePath}?page=1&limit=100`)
          .set('Authorization', `Bearer ${this.authToken}`)
          .expect(200)

        expect(response.body.error).toBe(false)
        expect(response.body.data.length).toBeLessThanOrEqual(100)
      })
    })
  }

  /**
   * Model'den required field'ları çıkarır
   */
  private getRequiredFields(): string[] {
    const schema = this.model.schema
    const requiredFields: string[] = []

    schema.eachPath((path, schemaType) => {
      if (schemaType.isRequired && path !== '_id' && path !== '__v') {
        requiredFields.push(path)
      }
    })

    return requiredFields
  }

  /**
   * Email field'larını bulur
   */
  private getEmailFields(): string[] {
    const schema = this.model.schema
    const emailFields: string[] = []

    schema.eachPath((path, schemaType) => {
      if (path.toLowerCase().includes('email')) {
        emailFields.push(path)
      }
    })

    return emailFields
  }

  /**
   * Phone field'larını bulur
   */
  private getPhoneFields(): string[] {
    const schema = this.model.schema
    const phoneFields: string[] = []

    schema.eachPath((path, schemaType) => {
      if (path.toLowerCase().includes('phone')) {
        phoneFields.push(path)
      }
    })

    return phoneFields
  }
}

/**
 * Test data generator - model'e göre otomatik test data oluşturur
 */
export class TestDataGenerator {
  public static generateForModel(model: Model<any>, modelName: string): TestData {
    const schema = model.schema
    const validData: any = {}
    const invalidData: any = {}
    const updateData: any = {}

    schema.eachPath((path, schemaType) => {
      if (path === '_id' || path === '__v') return

      const fieldType = schemaType.instance
      const isRequired = schemaType.isRequired

      // Valid data
      if (isRequired) {
        validData[path] = this.generateValidValue(fieldType, path)
        updateData[path] = this.generateValidValue(fieldType, path)
      }

      // Invalid data (only for required fields)
      if (isRequired) {
        invalidData[path] = this.generateInvalidValue(fieldType)
      }
    })

    return {
      valid: validData,
      invalid: invalidData,
      update: updateData,
    }
  }

  private static generateValidValue(fieldType: string, fieldName: string): any {
    switch (fieldType) {
      case 'String':
        if (fieldName.includes('email')) return 'test@example.com'
        if (fieldName.includes('password')) return 'Test123!'
        if (fieldName.includes('phone')) return '+905551234567'
        if (fieldName.includes('name')) return 'Test Name'
        if (fieldName.includes('title')) return 'Test Title'
        if (fieldName.includes('description')) return 'Test Description'
        return 'Test String'

      case 'Number':
        return 123

      case 'Boolean':
        return true

      case 'Date':
        return new Date()

      case 'ObjectId':
        return '507f1f77bcf86cd799439011'

      case 'Array':
        return ['item1', 'item2']

      default:
        return 'Default Value'
    }
  }

  private static generateInvalidValue(fieldType: string): any {
    switch (fieldType) {
      case 'String':
        return 123 // Number instead of string

      case 'Number':
        return 'invalid' // String instead of number

      case 'Boolean':
        return 'invalid' // String instead of boolean

      case 'Date':
        return 'invalid-date' // Invalid date string

      default:
        return null
    }
  }
}
