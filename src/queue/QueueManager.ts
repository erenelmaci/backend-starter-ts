import { Queue, Worker, Job } from 'bullmq'
import { redisConnection } from '../cache/redis-connection'

interface JobData {
  [key: string]: any
}

interface JobOptions {
  delay?: number
  attempts?: number
  backoff?: {
    type: 'exponential' | 'fixed'
    delay: number
  }
  removeOnComplete?: number
  removeOnFail?: number
}

export class QueueManager {
  private static instance: QueueManager
  private queues: Map<string, Queue> = new Map()
  private workers: Map<string, Worker> = new Map()

  private constructor() {}

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager()
    }
    return QueueManager.instance
  }

  /**
   * Queue oluşturur
   */
  public createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!
    }

    const queue = new Queue(queueName, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })

    this.queues.set(queueName, queue)
    return queue
  }

  /**
   * Job ekler
   */
  public async addJob(
    queueName: string,
    jobName: string,
    data: JobData,
    options?: JobOptions,
  ): Promise<Job> {
    const queue = this.createQueue(queueName)
    return await queue.add(jobName, data, options)
  }

  /**
   * Worker oluşturur
   */
  public createWorker(queueName: string, processor: (job: Job) => Promise<any>): Worker {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!
    }

    const worker = new Worker(queueName, processor, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      concurrency: 5,
    })

    // Worker event listeners
    worker.on('completed', job => {
      console.log(`Job ${job.id} completed in queue ${queueName}`)
    })

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed in queue ${queueName}:`, err)
    })

    worker.on('error', err => {
      console.error(`Worker error in queue ${queueName}:`, err)
    })

    this.workers.set(queueName, worker)
    return worker
  }

  /**
   * Queue durumunu kontrol eder
   */
  public async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const waiting = await queue.getWaiting()
    const active = await queue.getActive()
    const completed = await queue.getCompleted()
    const failed = await queue.getFailed()

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    }
  }

  /**
   * Tüm queue'ları temizler
   */
  public async clearAllQueues(): Promise<void> {
    for (const [queueName, queue] of this.queues) {
      await queue.obliterate({ force: true })
    }
  }

  /**
   * Worker'ları durdurur
   */
  public async closeAllWorkers(): Promise<void> {
    for (const [queueName, worker] of this.workers) {
      await worker.close()
    }
    this.workers.clear()
  }

  /**
   * Queue'ları kapatır
   */
  public async closeAllQueues(): Promise<void> {
    for (const [queueName, queue] of this.queues) {
      await queue.close()
    }
    this.queues.clear()
  }

  /**
   * Job'ı iptal eder
   */
  public async cancelJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const job = await queue.getJob(jobId)
    if (job) {
      await job.remove()
    }
  }

  /**
   * Failed job'ları tekrar dener
   */
  public async retryFailedJobs(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const failedJobs = await queue.getFailed()
    for (const job of failedJobs) {
      await job.retry()
    }
  }
}

// Singleton instance
export const queueManager = QueueManager.getInstance()

// Predefined queue names
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  FILE_PROCESSING: 'file-processing-queue',
  CLEANUP: 'cleanup-queue',
  BACKUP: 'backup-queue',
} as const
