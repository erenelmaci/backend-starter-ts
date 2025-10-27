import fs from 'fs'
import path from 'path'
import { Model } from 'mongoose'

interface ModelInfo {
  name: string
  model: Model<any>
  basePath: string
  hasAuth?: boolean
  hasAdmin?: boolean
}

/**
 * Otomatik test dosyası oluşturucu
 */
export class AutoTestGenerator {
  private static readonly TEST_TEMPLATE = `import request from 'supertest'
import { Express } from 'express'
import { CRUDTestGenerator } from '../utils/CRUDTestGenerator'
import { TestDataGenerator } from '../utils/TestDataGenerator'
import { testUtils } from '../utils/testSetup'
import {{MODEL_NAME}} from '../../apps/{{MODEL_PATH}}/model'

// Test app'i import et
let app: Express

// Test token'ları
let authToken: string
let adminToken: string

describe('{{MODEL_NAME}} Model Tests', () => {
  beforeAll(async () => {
    // App'i import et
    app = require('../../index').default
    
    // Test token'ları oluştur
    authToken = testUtils.createTestToken('user123')
    adminToken = testUtils.createTestToken('admin123')
  })

  // {{MODEL_NAME}} CRUD Tests
  const {{MODEL_VAR}}TestData = TestDataGenerator.generateForModel({{MODEL_NAME}}.Model, '{{MODEL_NAME}}')
  
  const {{MODEL_VAR}}CRUDTests = new CRUDTestGenerator(app, {
    model: {{MODEL_NAME}}.Model,
    modelName: '{{MODEL_NAME}}',
    testData: {{MODEL_VAR}}TestData,
    basePath: '{{BASE_PATH}}',
    authToken,
    adminToken,
  })

  // Generate all test suites
  {{MODEL_VAR}}CRUDTests.generateCRUDTests()
  {{MODEL_VAR}}CRUDTests.generateValidationTests()
  {{MODEL_VAR}}CRUDTests.generatePermissionTests()
  {{MODEL_VAR}}CRUDTests.generatePerformanceTests()

  // Custom {{MODEL_NAME}}-specific tests
  describe('{{MODEL_NAME}} Specific Tests', () => {
    let created{{MODEL_NAME}}Id: string

    beforeEach(async () => {
      // Her test öncesi temiz {{MODEL_VAR}} oluştur
      const mock{{MODEL_NAME}} = {{MOCK_DATA}}
      
      const response = await request(app)
        .post('{{BASE_PATH}}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(mock{{MODEL_NAME}})
        .expect(201)
      
      created{{MODEL_NAME}}Id = response.body._id
    })

    {{CUSTOM_TESTS}}
  })
})
`

  /**
   * Model için otomatik test dosyası oluşturur
   */
  public static generateTestFile(modelInfo: ModelInfo): void {
    const { name, model, basePath, hasAuth = true, hasAdmin = true } = modelInfo

    // Model path'i oluştur (camelCase to kebab-case)
    const modelPath = name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1)

    // Model variable name (camelCase)
    const modelVar = name.charAt(0).toLowerCase() + name.slice(1)

    // Mock data oluştur
    const mockData = this.generateMockData(model)

    // Custom tests oluştur
    const customTests = this.generateCustomTests(name, model)

    // Template'i doldur
    const testContent = this.TEST_TEMPLATE.replace(/{{MODEL_NAME}}/g, name)
      .replace(/{{MODEL_PATH}}/g, modelPath)
      .replace(/{{MODEL_VAR}}/g, modelVar)
      .replace(/{{BASE_PATH}}/g, basePath)
      .replace(/{{MOCK_DATA}}/g, mockData)
      .replace(/{{CUSTOM_TESTS}}/g, customTests)

    // Test dosyası yolunu oluştur
    const testFilePath = path.join(process.cwd(), 'src', 'tests', 'models', `${modelVar}.test.ts`)

    // Test dosyasını oluştur
    fs.writeFileSync(testFilePath, testContent)

    console.log(`✅ Test file created: ${testFilePath}`)
  }

  /**
   * Model'e göre mock data oluşturur
   */
  private static generateMockData(model: Model<any>): string {
    const schema = model.schema
    const mockData: any = {}

    schema.eachPath((path, schemaType) => {
      if (path === '_id' || path === '__v') return

      const fieldType = schemaType.instance
      const isRequired = schemaType.isRequired

      if (isRequired) {
        mockData[path] = this.generateMockValue(fieldType, path)
      }
    })

    return JSON.stringify(mockData, null, 6)
  }

  /**
   * Field type'a göre mock value oluşturur
   */
  private static generateMockValue(fieldType: string, fieldName: string): any {
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
        return 'new Date()'

      case 'ObjectId':
        return "'507f1f77bcf86cd799439011'"

      case 'Array':
        return "['item1', 'item2']"

      default:
        return 'Default Value'
    }
  }

  /**
   * Model'e özel custom testler oluşturur
   */
  private static generateCustomTests(modelName: string, model: Model<any>): string {
    const schema = model.schema
    const tests: string[] = []

    // Email field varsa unique email testi
    schema.eachPath(path => {
      if (path.toLowerCase().includes('email')) {
        tests.push(
          `
    it('should validate unique email', async () => {
      const duplicate{{MODEL_NAME}} = { ...mock{{MODEL_NAME}}, email: 'duplicate@example.com' }
      
      // İlk {{MODEL_VAR}}'ı oluştur
      await request(app)
        .post('{{BASE_PATH}}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(duplicate{{MODEL_NAME}})
        .expect(201)

      // Aynı email ile ikinci {{MODEL_VAR}}'ı oluşturmaya çalış
      await request(app)
        .post('{{BASE_PATH}}')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(duplicate{{MODEL_NAME}})
        .expect(400) // Duplicate email error
    })`
            .replace(/{{MODEL_NAME}}/g, modelName)
            .replace(/{{MODEL_VAR}}/g, modelName.charAt(0).toLowerCase() + modelName.slice(1))
            .replace(/{{BASE_PATH}}/g, '/api/' + modelName.toLowerCase() + 's'),
        )
      }
    })

    // Password field varsa hash testi
    schema.eachPath(path => {
      if (path.toLowerCase().includes('password')) {
        tests.push(
          `
    it('should hash password before saving', async () => {
      const response = await request(app)
        .get(\`{{BASE_PATH}}/\${created{{MODEL_NAME}}Id}\`)
        .set('Authorization', \`Bearer \${authToken}\`)
        .expect(200)

      // Password hash'lenmiş olmalı
      expect(response.body.password).not.toBe('Test123!')
      expect(response.body.password).toMatch(/^\\$2[aby]\\$\\d+\\$/)
    })`
            .replace(/{{MODEL_NAME}}/g, modelName)
            .replace(/{{BASE_PATH}}/g, '/api/' + modelName.toLowerCase() + 's'),
        )
      }
    })

    // Name field varsa search testi
    schema.eachPath(path => {
      if (path.toLowerCase().includes('name')) {
        tests.push(
          `
    it('should support search by name', async () => {
      const response = await request(app)
        .get('{{BASE_PATH}}?search=Test Name')
        .set('Authorization', \`Bearer \${authToken}\`)
        .expect(200)

      expect(response.body.error).toBe(false)
      expect(Array.isArray(response.body.data)).toBe(true)
    })`.replace(/{{BASE_PATH}}/g, '/api/' + modelName.toLowerCase() + 's'),
        )
      }
    })

    return tests.join('\n')
  }

  /**
   * Tüm modeller için test dosyalarını oluşturur
   */
  public static generateAllTests(): void {
    const modelsDir = path.join(process.cwd(), 'src', 'apps')

    if (!fs.existsSync(modelsDir)) {
      console.log('❌ Apps directory not found')
      return
    }

    const apps = fs
      .readdirSync(modelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const app of apps) {
      const modelPath = path.join(modelsDir, app, 'model.ts')

      if (fs.existsSync(modelPath)) {
        try {
          // Model'i dinamik olarak import et
          const modelModule = require(modelPath)
          const ModelClass = modelModule.default || modelModule

          if (ModelClass && ModelClass.Model) {
            const modelName = ModelClass.name || app.charAt(0).toUpperCase() + app.slice(1)
            const basePath = `/api/${app.replace(/([A-Z])/g, '-$1').toLowerCase()}`

            this.generateTestFile({
              name: modelName,
              model: ModelClass.Model,
              basePath,
              hasAuth: true,
              hasAdmin: true,
            })
          }
        } catch (error) {
          console.log(`❌ Error processing ${app}:`, (error as Error).message)
        }
      }
    }
  }
}
