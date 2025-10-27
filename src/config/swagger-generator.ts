/* *******************************************************
 * NODEJS PROJECT © 2025 - BURSAYAZİLİMEVİ.COM *
 ******************************************************* */

import { Model } from 'mongoose'
import { IBaseDocument } from '../database/Model'

interface SwaggerPath {
  [key: string]: {
    get?: any
    post?: any
    put?: any
    delete?: any
  }
}

interface SwaggerSchema {
  [key: string]: any
}

export class SwaggerGenerator {
  private static generateCRUDPaths(
    modelName: string,
    model: Model<any>,
    basePath: string,
  ): SwaggerPath {
    const paths: SwaggerPath = {}
    const entityName = modelName.toLowerCase()
    const entityPath = `${basePath}/${entityName}s`

    // LIST endpoint
    paths[entityPath] = {
      get: {
        summary: `${modelName} listesini getirir`,
        tags: [modelName],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Sayfa numarası',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 20 },
            description: 'Sayfa başına kayıt sayısı',
          },
          {
            in: 'query',
            name: 'filter[field]',
            schema: { type: 'string' },
            description: 'Filtreleme (gt:, gte:, lt:, lte:, ne:, eq:, regex:, in:, nin:)',
          },
          {
            in: 'query',
            name: 'sort[field]',
            schema: { type: 'string', enum: ['asc', 'desc'] },
            description: 'Sıralama',
          },
          {
            in: 'query',
            name: 'select',
            schema: { type: 'string' },
            description: 'Döndürülecek alanlar',
          },
        ],
        responses: {
          200: {
            description: `${modelName} listesi`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: false },
                    method: { type: 'string', example: 'GET' },
                    info: {
                      type: 'object',
                      properties: {
                        totalRecords: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        pages: { type: 'object' },
                      },
                    },
                    data: {
                      type: 'array',
                      items: { $ref: `#/components/schemas/${modelName}` },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: `Yeni ${modelName} oluşturur`,
        tags: [modelName],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${modelName}Create` },
            },
          },
        },
        responses: {
          201: {
            description: `${modelName} oluşturuldu`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Created successfully' },
                    data: { $ref: `#/components/schemas/${modelName}` },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    }

    // READ endpoint
    paths[`${entityPath}/{id}`] = {
      get: {
        summary: `${modelName} detaylarını getirir`,
        tags: [modelName],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: `${modelName} ID`,
          },
        ],
        responses: {
          200: {
            description: `${modelName} detayları`,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${modelName}` },
              },
            },
          },
          404: {
            description: `${modelName} bulunamadı`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Not found' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: `${modelName} günceller`,
        tags: [modelName],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: `${modelName} ID`,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${modelName}Update` },
            },
          },
        },
        responses: {
          200: {
            description: `${modelName} güncellendi`,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${modelName}` },
              },
            },
          },
          404: {
            description: `${modelName} bulunamadı`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Not found' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: `${modelName} siler`,
        tags: [modelName],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: `${modelName} ID`,
          },
        ],
        responses: {
          200: {
            description: `${modelName} silindi`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Record removed successfully' },
                    data: { $ref: `#/components/schemas/${modelName}` },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          404: {
            description: `${modelName} bulunamadı`,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Not found' },
                  },
                },
              },
            },
          },
        },
      },
    }

    return paths
  }

  private static generateSchemas(modelName: string, model: any): SwaggerSchema {
    const schemas: SwaggerSchema = {}

    // Base schema
    schemas[modelName] = {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Unique identifier' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean', default: true },
        isExists: { type: 'boolean', default: true },
        canUpdate: { type: 'boolean', default: true },
        canDelete: { type: 'boolean', default: true },
        createdByUserId: { type: 'string', nullable: true },
        updatedByUserId: { type: 'string', nullable: true },
        deletedByUserId: { type: 'string', nullable: true },
        notes: { type: 'string', nullable: true },
        sortNumber: { type: 'number', default: 0 },
      },
    }

    // Create schema
    schemas[`${modelName}Create`] = {
      type: 'object',
      required: [],
      properties: {},
    }

    // Update schema
    schemas[`${modelName}Update`] = {
      type: 'object',
      properties: {},
    }

    return schemas
  }

  public static generateFromModels(
    models: { [key: string]: { Model: Model<any> } },
    basePath: string = '/api',
  ) {
    const paths: SwaggerPath = {}
    const schemas: SwaggerSchema = {}

    Object.keys(models).forEach(modelName => {
      const model = models[modelName].Model

      // Generate CRUD paths
      const modelPaths = this.generateCRUDPaths(modelName, model, basePath)
      Object.assign(paths, modelPaths)

      // Generate schemas
      const modelSchemas = this.generateSchemas(modelName, model)
      Object.assign(schemas, modelSchemas)
    })

    return { paths, schemas }
  }
}
