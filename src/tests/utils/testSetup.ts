import mongoose from 'mongoose'

// Test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
process.env.MONGO_URI = 'mongodb://localhost:27017/backend-starter-test'
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock Redis connection for tests
jest.mock('../../cache/redis-connection', () => ({
  redisConnection: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isRedisConnected: jest.fn().mockReturnValue(true),
    getClient: jest.fn().mockReturnValue({
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(1),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      sadd: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      srem: jest.fn().mockResolvedValue(1),
      scard: jest.fn().mockResolvedValue(0),
      smembers: jest.fn().mockResolvedValue([]),
    }),
  },
}))

// Mock MongoDB connection for tests
jest.mock('../../database/mongodb', () => ({
  connectToMongoDB: jest.fn().mockResolvedValue(undefined),
}))

// Test database connection
beforeAll(async () => {
  // MongoDB test connection - skip if not available
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/backend-starter-test'
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB test connection successful')
  } catch (error) {
    console.warn('⚠️ MongoDB test connection failed, using mock:', (error as Error).message)
  }
})

// Clean up after each test
afterEach(async () => {
  // Clear all collections if MongoDB is connected
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections
      for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany({})
      }
    }
  } catch (error) {
    // MongoDB cleanup failed, continue
  }
})

// Close connections after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
    }
  } catch (error) {
    // MongoDB disconnect failed, continue
  }
})

// Global test timeout
jest.setTimeout(30000)

// Test utilities
export const testUtils = {
  /**
   * Test için mock user oluşturur
   */
  createMockUser: (overrides: any = {}) => ({
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'Test123!',
    role: 'user',
    ...overrides,
  }),

  /**
   * Test için mock admin oluşturur
   */
  createMockAdmin: (overrides: any = {}) => ({
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'Admin123!',
    role: 'admin',
    ...overrides,
  }),

  /**
   * Test token oluşturur
   */
  createTestToken: (userId: string = '507f1f77bcf86cd799439011') => {
    return `test-token-${userId}`
  },

  /**
   * Test için random string oluşturur
   */
  randomString: (length: number = 10) => {
    return Math.random()
      .toString(36)
      .substring(2, length + 2)
  },

  /**
   * Test için random email oluşturur
   */
  randomEmail: () => {
    return `test-${Math.random().toString(36).substring(2, 8)}@example.com`
  },

  /**
   * Test için bekleme fonksiyonu
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
}
