import { Request, Response, Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'))

function getAllYamlFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getAllYamlFiles(fullPath, arrayOfFiles)
    } else if (fullPath.endsWith('.yaml')) {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}

function loadYamlFiles(files: string[]) {
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      license: {
        name: packageJson.license,
      },
      contact: {
        email: 'info@bursayazilimevi.com',
        url: 'https://bursayazilimevi.com',
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL,
        description:
          process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {},
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {},
  }

  try {
    // Read the global YAML file
    const globalYamlPath = path.join(__dirname, '../../src/routes/swagger.yaml')
    if (fs.existsSync(globalYamlPath)) {
      const globalYamlContent = fs.readFileSync(globalYamlPath, 'utf8')
      const globalYamlData = yaml.load(globalYamlContent) as any

      if (globalYamlData) {
        // Merge global data
        if (globalYamlData.components) {
          Object.assign(swaggerSpec.components, globalYamlData.components)
        }
        if (globalYamlData.security) {
          swaggerSpec.security = globalYamlData.security
        }
      }
    }

    // Read and merge module-specific YAML files
    files.forEach(file => {
      try {
        const yamlContent = fs.readFileSync(file, 'utf8')
        const yamlData = yaml.load(yamlContent) as any

        if (yamlData) {
          // Merge paths
          if (yamlData.paths) {
            Object.assign(swaggerSpec.paths, yamlData.paths)
          }

          // Merge schemas
          if (yamlData.components && yamlData.components.schemas) {
            Object.assign(swaggerSpec.components.schemas, yamlData.components.schemas)
          }
        }
      } catch (error) {
        console.error(`Error loading YAML file ${file}:`, error)
      }
    })
  } catch (error) {
    console.error('Error loading global YAML file:', error)
  }

  return swaggerSpec
}

const yamlFiles = getAllYamlFiles(path.join(__dirname, '../../src/apps'))
const swaggerSpec = loadYamlFiles(yamlFiles)

export const setupSwagger = (app: Express) => {
  app.use(
    `${API_URL}/documents/swagger`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: `${packageJson.name} Documentation`,
      swaggerOptions: {
        filter: true,
        displayRequestDuration: true,
        persistAuthorization: true,
      },
    }),
  )

  app.get(`${API_URL}/documents/json`, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}
