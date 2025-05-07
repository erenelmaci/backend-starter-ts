import { Request, Response } from 'express'
import { writeFileSync, readdirSync, existsSync, cpSync } from 'fs'
import path from 'path'

const resetToTestData = async (req: Request, res: Response) => {
  const dataDir = path.join(__dirname, '../../src/tests/data')
  const appsDir = path.join(__dirname, '../../src/apps')
  const time = new Date().toISOString().replace(/[:.]/g, '-')

  try {
    // Write to file functionality
    if (req.query?.writeToFile) {
      const backupDir = path.join(__dirname, `../../tests/data-${time}`)
      cpSync(dataDir, backupDir, { recursive: true })
    }

    const dirs = readdirSync(appsDir, { withFileTypes: true }).filter(d => d.isDirectory())

    if (dirs.length === 0) {
      console.error('No directories found in apps directory.')
      res.status(500).send('No directories found.')
      return
    }

    const modelExtensions = ['.ts', '.js']

    for (const dirent of dirs) {
      let modelPath: string | null = null

      // Kontrol etmek için her iki uzantıyı da deneriz
      for (const ext of modelExtensions) {
        const potentialPath = path.join(appsDir, dirent.name, `model${ext}`)
        if (existsSync(potentialPath)) {
          modelPath = potentialPath
          break
        }
      }

      if (!modelPath) {
        console.log(`No model found in ${dirent.name}`)
        continue
      }

      console.log(`Checking if model exists in: ${modelPath}`)
      const model = require(modelPath)
      if (!model?.Model) {
        console.error(`No model exported in ${modelPath}`)
        continue
      }

      const dataFile = path.join(dataDir, `${dirent.name}.js`)
      console.log(`Checking for data file: ${dataFile}`)

      if (req.query?.writeToFile) {
        const records = await model.Model.find().sort({ _id: 1 })
        console.log(`Exporting data for model: ${dirent.name}, records count: ${records.length}`)
        writeFileSync(dataFile, `module.exports = ${JSON.stringify(records, null, 2)}`, 'utf-8')
      } else {
        if (!existsSync(dataFile)) {
          console.error(`Data file not found for ${dirent.name}. Skipping...`)
          continue
        }

        delete require.cache[dataFile]
        const data = require(dataFile)

        if (!Array.isArray(data)) {
          console.warn(`Invalid data format in ${dirent.name}.js: Data must be an array.`)
          continue
        }

        console.log(`Deleting all records from ${dirent.name} model`)
        const deleteResult = await model.Model.deleteMany({})
        console.log(`Deleted ${deleteResult.deletedCount} records from ${dirent.name}`)

        console.log(`Inserting data into ${dirent.name} model`)
        const insertResult = await model.Model.insertMany(data)
        console.log(`Inserted ${insertResult.length} records into ${dirent.name}`)
      }
    }

    res.send('√ RESETTING WAS COMPLETE.')
  } catch (error) {
    console.error('Error during resetting:', error)
    res.status(500).send('X RESETTING FAILED')
  }
}

export default resetToTestData
