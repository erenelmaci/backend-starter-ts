import { Model } from 'mongoose'
import { IBaseDocument } from '../database/Model'
import { queueManager, QUEUE_NAMES } from '../queue/QueueManager'
import { rabbitMQManager } from '../queue/amqp-connection'

interface CleanupStages {
  markAsInactive?: number // milliseconds
  softDelete?: number // milliseconds
  hardDelete?: number // milliseconds
}

interface CleanupJobOptions {
  model: Model<any>
  loginField?: string
  stages: CleanupStages
  deletedAtBased?: boolean
  enable?: boolean
}

export class BaseCleanupJob {
  private model: Model<any>
  private loginField?: string
  private stages: CleanupStages
  private deletedAtBased: boolean
  private enable: boolean

  constructor(options: CleanupJobOptions) {
    this.model = options.model
    this.loginField = options.loginField || undefined
    this.stages = options.stages
    this.deletedAtBased = options.deletedAtBased || false
    this.enable = options.enable !== false
  }

  /**
   * Cleanup job'ını çalıştırır
   */
  public async run(now: number = Date.now()): Promise<void> {
    if (!this.enable) {
      console.log(`Cleanup job for ${this.model.modelName} is disabled`)
      return
    }

    console.log(`Starting cleanup job for ${this.model.modelName}`)
    const ops = []

    // Login field based cleanup
    if (this.loginField) {
      if (this.stages.markAsInactive) {
        ops.push({
          filter: {
            [this.loginField]: { $lte: new Date(now - this.stages.markAsInactive) },
            isExists: true,
          },
          update: { isExists: false },
          operation: 'markAsInactive',
        })
      }

      if (this.stages.softDelete) {
        ops.push({
          filter: {
            [this.loginField]: { $lte: new Date(now - this.stages.softDelete) },
            isExists: false,
            deletedAt: { $exists: false },
          },
          update: { deletedAt: new Date() },
          operation: 'softDelete',
        })
      }

      if (this.stages.hardDelete) {
        ops.push({
          filter: {
            [this.loginField]: { $lte: new Date(now - this.stages.hardDelete) },
            deletedAt: { $exists: true },
          },
          delete: true,
          operation: 'hardDelete',
        })
      }
    }

    // DeletedAt based cleanup
    if (this.deletedAtBased) {
      if (this.stages.hardDelete) {
        ops.push({
          filter: {
            deletedAt: { $lte: new Date(now - this.stages.hardDelete) },
          },
          delete: true,
          operation: 'hardDelete',
        })
      }
    }

    // Operations'ları çalıştır
    for (const op of ops) {
      try {
        if (op.delete) {
          const result = await this.model.deleteMany(op.filter)
          console.log(
            `${op.operation}: Deleted ${result.deletedCount} records from ${this.model.modelName}`,
          )
        } else {
          const result = await this.model.updateMany(op.filter, { $set: op.update })
          console.log(
            `${op.operation}: Updated ${result.modifiedCount} records in ${this.model.modelName}`,
          )
        }
      } catch (error) {
        console.error(`Error in ${op.operation} for ${this.model.modelName}:`, error)
      }
    }

    console.log(`Cleanup job completed for ${this.model.modelName}`)
  }

  /**
   * Job'ı queue'ya ekler
   */
  public async scheduleJob(): Promise<void> {
    await queueManager.addJob(
      QUEUE_NAMES.CLEANUP,
      'cleanup-job',
      {
        modelName: this.model.modelName,
        stages: this.stages,
        loginField: this.loginField,
        deletedAtBased: this.deletedAtBased,
      },
      {
        delay: 0,
        attempts: 3,
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    )
  }
}

/**
 * Cronjob Manager - Tüm cronjob'ları yönetir
 */
export class CronjobManager {
  private static instance: CronjobManager
  private jobs: Map<string, BaseCleanupJob> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {
    this.initializeWorkers()
  }

  public static getInstance(): CronjobManager {
    if (!CronjobManager.instance) {
      CronjobManager.instance = new CronjobManager()
    }
    return CronjobManager.instance
  }

  private initializeWorkers(): void {
    // BullMQ Worker for cleanup jobs
    queueManager.createWorker(QUEUE_NAMES.CLEANUP, async job => {
      const { modelName, stages, loginField, deletedAtBased } = job.data

      // Model'i dinamik olarak import et
      const model = await this.getModelByName(modelName)
      if (!model) {
        throw new Error(`Model ${modelName} not found`)
      }

      const cleanupJob = new BaseCleanupJob({
        model,
        loginField,
        stages,
        deletedAtBased,
        enable: true,
      })

      await cleanupJob.run()
    })
  }

  private async getModelByName(modelName: string): Promise<Model<any> | null> {
    try {
      // Model'leri dinamik olarak import et
      const models = {
        User: require('../apps/user/model').default.Model,
        EmailTemplate: require('../apps/emailTemplate/model').default.Model,
        File: require('../apps/fileModule/model').default.Model,
        Notification: require('../apps/notification/model').default.Model,
      }

      return models[modelName as keyof typeof models] || null
    } catch (error) {
      console.error(`Error importing model ${modelName}:`, error)
      return null
    }
  }

  /**
   * Cleanup job ekler
   */
  public addCleanupJob(jobName: string, options: CleanupJobOptions): BaseCleanupJob {
    const job = new BaseCleanupJob(options)
    this.jobs.set(jobName, job)
    return job
  }

  /**
   * Job'ı belirli aralıklarla çalıştırır
   */
  public scheduleJob(jobName: string, intervalMs: number): void {
    const job = this.jobs.get(jobName)
    if (!job) {
      throw new Error(`Job ${jobName} not found`)
    }

    // Mevcut interval'ı temizle
    if (this.intervals.has(jobName)) {
      clearInterval(this.intervals.get(jobName)!)
    }

    // Yeni interval oluştur
    const interval = setInterval(async () => {
      try {
        await job.run()
      } catch (error) {
        console.error(`Error running job ${jobName}:`, error)
      }
    }, intervalMs)

    this.intervals.set(jobName, interval)
    console.log(`Job ${jobName} scheduled to run every ${intervalMs}ms`)
  }

  /**
   * Job'ı durdurur
   */
  public stopJob(jobName: string): void {
    const interval = this.intervals.get(jobName)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(jobName)
      console.log(`Job ${jobName} stopped`)
    }
  }

  /**
   * Tüm job'ları durdurur
   */
  public stopAllJobs(): void {
    for (const [jobName, interval] of this.intervals) {
      clearInterval(interval)
      console.log(`Job ${jobName} stopped`)
    }
    this.intervals.clear()
  }

  /**
   * Job'ı bir kez çalıştırır
   */
  public async runJobOnce(jobName: string): Promise<void> {
    const job = this.jobs.get(jobName)
    if (!job) {
      throw new Error(`Job ${jobName} not found`)
    }

    await job.run()
  }

  /**
   * Tüm job'ları listeler
   */
  public listJobs(): Array<{ name: string; scheduled: boolean }> {
    return Array.from(this.jobs.keys()).map(name => ({
      name,
      scheduled: this.intervals.has(name),
    }))
  }
}

// Singleton instance
export const cronjobManager = CronjobManager.getInstance()

// Predefined cleanup jobs
export const CLEANUP_JOBS = {
  USER_CLEANUP: 'user-cleanup',
  SESSION_CLEANUP: 'session-cleanup',
  FILE_CLEANUP: 'file-cleanup',
  LOG_CLEANUP: 'log-cleanup',
} as const
