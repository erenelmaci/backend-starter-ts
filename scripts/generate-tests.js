#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// AutoTestGenerator'ı require et
const { AutoTestGenerator } = require('../dist/tests/utils/AutoTestGenerator')

const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'generate':
    console.log('🚀 Generating test files for all models...')
    AutoTestGenerator.generateAllTests()
    console.log('✅ All test files generated successfully!')
    break

  case 'generate-model':
    const modelName = args[1]
    if (!modelName) {
      console.log('❌ Please provide model name: npm run test:generate-model <ModelName>')
      process.exit(1)
    }

    console.log(`🚀 Generating test file for ${modelName} model...`)

    // Model dosyasını bul
    const modelPath = path.join(process.cwd(), 'src', 'apps', modelName.toLowerCase(), 'model.ts')

    if (!fs.existsSync(modelPath)) {
      console.log(`❌ Model file not found: ${modelPath}`)
      console.log('Available models:')

      const appsDir = path.join(process.cwd(), 'src', 'apps')
      const apps = fs
        .readdirSync(appsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      apps.forEach(app => {
        const appModelPath = path.join(appsDir, app, 'model.ts')
        if (fs.existsSync(appModelPath)) {
          console.log(`  - ${app}`)
        }
      })

      process.exit(1)
    }

    try {
      const modelModule = require(modelPath)
      const ModelClass = modelModule.default || modelModule

      if (ModelClass && ModelClass.Model) {
        const basePath = `/api/${modelName.toLowerCase()}s`

        AutoTestGenerator.generateTestFile({
          name: ModelClass.name || modelName,
          model: ModelClass.Model,
          basePath,
          hasAuth: true,
          hasAdmin: true,
        })

        console.log(`✅ Test file generated for ${modelName} model!`)
      } else {
        console.log(`❌ Invalid model structure in ${modelPath}`)
        process.exit(1)
      }
    } catch (error) {
      console.log(`❌ Error loading model:`, error.message)
      process.exit(1)
    }
    break

  case 'help':
  default:
    console.log(`
🧪 Test Generator CLI

Usage:
  npm run test:generate              # Generate tests for all models
  npm run test:generate-model <name> # Generate test for specific model
  npm run test:help                 # Show this help

Examples:
  npm run test:generate
  npm run test:generate-model user
  npm run test:generate-model emailTemplate
`)
    break
}
