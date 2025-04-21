import { Request, Response, Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const packageJson = require(DIR + '/package.json');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(DIR + '/src/apps');

const options = {
  definition: {
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: files,
};

const swaggerSpec = swaggerJSDoc(options);

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
  );

  app.get(`${API_URL}/documents/json`, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
