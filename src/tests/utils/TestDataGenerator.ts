import { Model } from 'mongoose'

interface TestData {
  valid: any
  invalid: any
  update: any
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
