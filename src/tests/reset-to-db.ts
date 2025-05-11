import { Request, Response } from 'express'
import { writeFileSync, readdirSync, existsSync, cpSync } from 'fs'
import path from 'path'
import mongoose from 'mongoose'

const resetToTestData = async (req: Request, res: Response) => {
  const dataDir = path.join(__dirname, '../../src/tests/data')
  const appsDir = path.join(__dirname, '../../src/apps')
  const time = new Date().toISOString().replace(/[:.]/g, '-')

  const successResults: string[] = []
  const errorResults: string[] = []

  try {
    if (req.query?.writeToFile) {
      const backupDir = path.join(__dirname, `../../tests/data-${time}`)
      cpSync(dataDir, backupDir, { recursive: true })
    }

    const dirs = readdirSync(appsDir, { withFileTypes: true }).filter(d => d.isDirectory())

    if (dirs.length === 0) {
      res.status(500).send('<h1>No directories found.</h1>')
      return
    }

    const modelExtensions = ['.ts', '.js']

    for (const dirent of dirs) {
      let modelPath: string | null = null

      for (const ext of modelExtensions) {
        const potentialPath = path.join(appsDir, dirent.name, `model${ext}`)
        if (existsSync(potentialPath)) {
          modelPath = potentialPath
          break
        }
      }

      if (!modelPath) {
        continue
      }

      try {
        const modelModule = await import(modelPath)
        const modelName = modelModule.default.name

        if (!modelName) {
          continue
        }

        const Model = mongoose.model(modelName)

        const dataFile = path.join(dataDir, `${dirent.name}.js`)

        if (req.query?.writeToFile) {
          const records = await Model.find().sort({ _id: 1 })
          writeFileSync(dataFile, `module.exports = ${JSON.stringify(records, null, 2)}`, 'utf-8')
        } else {
          if (!existsSync(dataFile)) {
            continue
          }

          delete require.cache[dataFile]
          const imported = await import(dataFile)
          const data = imported.default

          if (!Array.isArray(data)) {
            continue
          }

          await Model.deleteMany({})

          for (const record of data) {
            const existingRecord = await Model.findOne({ email: record.email })
            if (existingRecord) {
              errorResults.push(
                `<li>${dirent.name}: Duplicate record found for ${record.email}</li>`,
              )
              continue
            }
          }

          const insertResult = await Model.insertMany(data)

          if (insertResult.length > 0) {
            successResults.push(`<li>${dirent.name}: Inserted ${insertResult.length} records</li>`)
          } else {
            errorResults.push(`<li>${dirent.name}: Insert failed</li>`)
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          errorResults.push(`<li>Error loading model for ${dirent.name}: ${err.message}</li>`)
        } else {
          errorResults.push(`<li>Unknown error loading model for ${dirent.name}</li>`)
        }
      }
    }

    // HTML formatında yanıt gönderme
    let htmlResponse = `
      <html>
        <head>
          <title>Reset Data Results</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: green; }
            ul { color: #333; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>Data Reset Results</h1>
          <h2>Success</h2>
          <ul>${successResults.join('')}</ul>
          <h2 class="error">Errors</h2>
          <ul class="error">${errorResults.join('')}</ul>
        </body>
      </html>
    `

    res.send(htmlResponse)
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(`<h1>Error: ${error.message}</h1>`)
    } else {
      res.status(500).send('<h1>Error: RESETTING FAILED</h1>')
    }
  }
}

export default resetToTestData
