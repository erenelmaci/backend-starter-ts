# 🧪 Test System Documentation

Bu backend starter template'i için comprehensive test sistemi dokümantasyonu.

## 📁 **Test Organizasyonu**

### **Klasör Yapısı**

```
src/tests/
├── models/                 # Model-specific tests
│   ├── user.test.ts
│   ├── emailTemplate.test.ts
│   └── file.test.ts
├── integration/            # Integration tests
│   ├── auth.test.ts
│   └── api.test.ts
└── utils/                 # Test utilities
    ├── CRUDTestGenerator.ts
    ├── TestDataGenerator.ts
    └── testSetup.ts
```

### **Test Kategorileri**

#### **1. Model Tests (`/models/`)**

- ✅ **CRUD Operations**: Create, Read, Update, Delete
- ✅ **Validation Tests**: Field validation, data types
- ✅ **Permission Tests**: Authentication, authorization
- ✅ **Performance Tests**: Bulk operations, large datasets
- ✅ **Model-specific Tests**: Unique business logic

#### **2. Integration Tests (`/integration/`)**

- ✅ **Authentication Flow**: Login, register, logout
- ✅ **API Integration**: End-to-end workflows
- ✅ **Security Tests**: Rate limiting, headers, CORS
- ✅ **Error Handling**: 404, 500, validation errors

#### **3. Utility Tests (`/utils/`)**

- ✅ **Test Generators**: CRUDTestGenerator, TestDataGenerator
- ✅ **Test Setup**: Database, Redis, cleanup
- ✅ **Helper Functions**: Mock data, assertions

## 🚀 **Test Commands**

### **Tüm Testler**

```bash
# Tüm testleri çalıştır
npm run test

# Watch mode
npm run test:watch

# Coverage ile
npm run test:coverage

# CI için
npm run test:ci
```

### **Kategori Bazlı Testler**

```bash
# Sadece model testleri
npm run test:models
npm run test:models:watch

# Sadece integration testleri
npm run test:integration
npm run test:integration:watch

# Sadece utility testleri
npm run test:utils
```

## 🔧 **Test Utilities**

### **CRUDTestGenerator**

Otomatik CRUD testleri oluşturur:

```typescript
const userCRUDTests = new CRUDTestGenerator(app, {
  model: User.Model,
  modelName: 'User',
  testData: userTestData,
  basePath: '/api/users',
  authToken,
  adminToken,
})

// Test suite'leri oluştur
userCRUDTests.generateCRUDTests()
userCRUDTests.generateValidationTests()
userCRUDTests.generatePermissionTests()
userCRUDTests.generatePerformanceTests()
```

### **TestDataGenerator**

Model'e göre otomatik test data oluşturur:

```typescript
const testData = TestDataGenerator.generateForModel(User.Model, 'User')
// {
//   valid: { email: 'test@example.com', password: 'Test123!', ... },
//   invalid: { email: 123, password: null, ... },
//   update: { email: 'updated@example.com', ... }
// }
```

### **Test Utils**

Test helper fonksiyonları:

```typescript
import { testUtils } from '../utils/testSetup'

// Mock user oluştur
const mockUser = testUtils.createMockUser({ role: 'admin' })

// Mock admin oluştur
const mockAdmin = testUtils.createMockAdmin()

// Test token oluştur
const token = testUtils.createTestToken('user123')

// Random email
const email = testUtils.randomEmail()

// Bekleme
await testUtils.wait(1000)
```

## 📊 **Test Coverage**

### **Coverage Thresholds**

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### **Coverage Reports**

- **Text**: Terminal output
- **HTML**: Browser'da görüntüleme
- **LCOV**: CI/CD integration
- **JSON**: Programmatic access

## 🎯 **Test Senaryoları**

### **Model Tests**

#### **User Model**

```typescript
describe('User Model Tests', () => {
  // CRUD Operations
  it('should create user with valid data')
  it('should return 400 for invalid data')
  it('should list users with pagination')
  it('should update user')
  it('should soft delete user')

  // Validation Tests
  it('should require email field')
  it('should validate email format')
  it('should validate unique email')
  it('should hash password before saving')

  // Permission Tests
  it('should require authentication')
  it('should require admin for delete')
  it('should allow admin all operations')

  // Performance Tests
  it('should handle bulk operations efficiently')
  it('should handle large dataset pagination')
})
```

#### **EmailTemplate Model**

```typescript
describe('EmailTemplate Model Tests', () => {
  // Template-specific tests
  it('should validate template variables')
  it('should support variable substitution')
  it('should validate unique template names')
  it('should support template preview')
  it('should validate content length')
})
```

#### **File Model**

```typescript
describe('File Model Tests', () => {
  // File-specific tests
  it('should validate file size limits')
  it('should validate allowed file types')
  it('should support file download')
  it('should support file preview')
  it('should support bulk file operations')
  it('should support file statistics')
})
```

### **Integration Tests**

#### **Authentication**

```typescript
describe('Authentication Integration Tests', () => {
  it('should login with valid credentials')
  it('should return 401 with invalid credentials')
  it('should set secure cookie on login')
  it('should register new user')
  it('should return 400 for duplicate email')
  it('should hash password before saving')
  it('should logout successfully')
  it('should clear cookie on logout')
  it('should track user sessions')
  it('should detect session hijacking')
})
```

#### **API Integration**

```typescript
describe('API Integration Tests', () => {
  it('should enforce global rate limiting')
  it('should enforce auth rate limiting')
  it('should include security headers')
  it('should detect suspicious activities')
  it('should handle CORS preflight requests')
  it('should handle 404 errors gracefully')
  it('should handle 500 errors gracefully')
  it('should serve Swagger UI')
  it('should serve Swagger JSON')
  it('should return health status')
})
```

## 🔄 **Test Lifecycle**

### **Setup**

```typescript
beforeAll(async () => {
  // MongoDB test connection
  await mongoose.connect(mongoUri)

  // Redis test connection
  await redisConnection.connect()

  // App import
  app = require('../../index').default
})
```

### **Cleanup**

```typescript
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }

  // Clear Redis test data
  const keys = await redis.keys('test:*')
  if (keys.length > 0) {
    await redis.del(...keys)
  }
})
```

### **Teardown**

```typescript
afterAll(async () => {
  await mongoose.connection.close()
  await redisConnection.disconnect()
})
```

## 🛠️ **Test Configuration**

### **Jest Config**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/utils/testSetup.ts'],
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  projects: [
    { displayName: 'models', testMatch: ['<rootDir>/src/tests/models/**/*.test.ts'] },
    { displayName: 'integration', testMatch: ['<rootDir>/src/tests/integration/**/*.test.ts'] },
    { displayName: 'utils', testMatch: ['<rootDir>/src/tests/utils/**/*.test.ts'] },
  ],
}
```

## 📈 **Best Practices**

### **1. Test Organization**

- ✅ Her model için ayrı test dosyası
- ✅ Integration testleri ayrı klasörde
- ✅ Utility fonksiyonları reusable
- ✅ Test kategorileri projeler halinde

### **2. Test Data Management**

- ✅ Otomatik test data generation
- ✅ Mock data utilities
- ✅ Test isolation (her test temiz başlar)
- ✅ Realistic test scenarios

### **3. Test Coverage**

- ✅ Minimum %70 coverage threshold
- ✅ Critical paths covered
- ✅ Edge cases tested
- ✅ Error scenarios covered

### **4. Performance Testing**

- ✅ Bulk operations tested
- ✅ Large dataset handling
- ✅ Response time assertions
- ✅ Memory usage monitoring

### **5. Security Testing**

- ✅ Authentication flows
- ✅ Authorization checks
- ✅ Rate limiting tests
- ✅ Security headers validation

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Test Timeout**

```typescript
// Increase timeout for specific test
jest.setTimeout(60000)
```

#### **Database Connection**

```typescript
// Ensure test database is running
const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/backend-starter-test'
```

#### **Redis Connection**

```typescript
// Ensure Redis is running
await redisConnection.connect()
```

#### **Test Isolation**

```typescript
// Clear data after each test
afterEach(async () => {
  await clearAllCollections()
  await clearRedisTestData()
})
```

## 🎯 **Sonuç**

Bu test sistemi ile:

- ✅ **Comprehensive Coverage**: Tüm modeller ve API'ler test edilir
- ✅ **Automated Testing**: Model-based otomatik test generation
- ✅ **Organized Structure**: Kategori bazlı test organizasyonu
- ✅ **Performance Testing**: Bulk operations ve large datasets
- ✅ **Security Testing**: Authentication, authorization, rate limiting
- ✅ **Integration Testing**: End-to-end workflows
- ✅ **CI/CD Ready**: Coverage thresholds ve automated reports

**Test sistemi production-ready ve industry best practices'e uygun!** 🚀
