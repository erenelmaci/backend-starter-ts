import { queueManager, QUEUE_NAMES } from '../queue/QueueManager'
import { rabbitMQManager, RABBITMQ_CONFIG } from '../queue/amqp-connection'
import { sendMail } from '../helpers/sendMail'
import { sendNotification } from '../helpers/sendNotification'

/**
 * Email Queue Service
 */
export class EmailQueueService {
  private static instance: EmailQueueService

  private constructor() {
    this.initializeWorkers()
  }

  public static getInstance(): EmailQueueService {
    if (!EmailQueueService.instance) {
      EmailQueueService.instance = new EmailQueueService()
    }
    return EmailQueueService.instance
  }

  private initializeWorkers(): void {
    // BullMQ Worker
    queueManager.createWorker(QUEUE_NAMES.EMAIL, async (job: any) => {
      const { to, subject, template, data } = job.data
      await sendMail(to, subject, template, data)
    })

    // RabbitMQ Consumer
    rabbitMQManager.consumeMessage(RABBITMQ_CONFIG.QUEUES.EMAIL_SEND, async (message: any) => {
      const { to, subject, template, data } = message
      await sendMail(to, subject, template, data)
    })
  }

  /**
   * Email gönderme job'ı ekler
   */
  public async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: any = {},
    options: any = {},
  ): Promise<void> {
    // BullMQ ile job ekle
    await queueManager.addJob(
      QUEUE_NAMES.EMAIL,
      'send-email',
      { to, subject, template, data },
      options,
    )

    // RabbitMQ ile de gönder (backup)
    await rabbitMQManager.publishMessage(
      RABBITMQ_CONFIG.EXCHANGES.EMAILS,
      RABBITMQ_CONFIG.ROUTING_KEYS.EMAIL_SEND,
      { to, subject, template, data },
    )
  }

  /**
   * Bulk email gönderimi
   */
  public async sendBulkEmails(
    emails: Array<{ to: string; subject: string; template: string; data: any }>,
    options: any = {},
  ): Promise<void> {
    for (const email of emails) {
      await this.sendEmail(email.to, email.subject, email.template, email.data, options)
    }
  }
}

/**
 * Notification Queue Service
 */
export class NotificationQueueService {
  private static instance: NotificationQueueService

  private constructor() {
    this.initializeWorkers()
  }

  public static getInstance(): NotificationQueueService {
    if (!NotificationQueueService.instance) {
      NotificationQueueService.instance = new NotificationQueueService()
    }
    return NotificationQueueService.instance
  }

  private initializeWorkers(): void {
    // BullMQ Worker
    queueManager.createWorker(QUEUE_NAMES.NOTIFICATION, async (job: any) => {
      const { userId, title, message, type, data } = job.data
      await sendNotification(userId, title, message, type, data)
    })

    // RabbitMQ Consumer
    rabbitMQManager.consumeMessage(
      RABBITMQ_CONFIG.QUEUES.NOTIFICATION_PUSH,
      async (notificationMessage: any) => {
        const { userId, title, message, type, data } = notificationMessage
        await sendNotification(userId, title, message, type, data)
      },
    )
  }

  /**
   * Notification gönderme job'ı ekler
   */
  public async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info',
    data: any = {},
    options: any = {},
  ): Promise<void> {
    // BullMQ ile job ekle
    await queueManager.addJob(
      QUEUE_NAMES.NOTIFICATION,
      'send-notification',
      { userId, title, message, type, data },
      options,
    )

    // RabbitMQ ile de gönder (backup)
    await rabbitMQManager.publishMessage(
      RABBITMQ_CONFIG.EXCHANGES.NOTIFICATIONS,
      RABBITMQ_CONFIG.ROUTING_KEYS.NOTIFICATION_PUSH,
      { userId, title, message, type, data },
    )
  }

  /**
   * Bulk notification gönderimi
   */
  public async sendBulkNotifications(
    notifications: Array<{
      userId: string
      title: string
      message: string
      type?: string
      data?: any
    }>,
    options: any = {},
  ): Promise<void> {
    for (const notification of notifications) {
      await this.sendNotification(
        notification.userId,
        notification.title,
        notification.message,
        notification.type,
        notification.data,
        options,
      )
    }
  }
}

/**
 * File Processing Queue Service
 */
export class FileProcessingQueueService {
  private static instance: FileProcessingQueueService

  private constructor() {
    this.initializeWorkers()
  }

  public static getInstance(): FileProcessingQueueService {
    if (!FileProcessingQueueService.instance) {
      FileProcessingQueueService.instance = new FileProcessingQueueService()
    }
    return FileProcessingQueueService.instance
  }

  private initializeWorkers(): void {
    // BullMQ Worker
    queueManager.createWorker(QUEUE_NAMES.FILE_PROCESSING, async (job: any) => {
      const { fileId, operation, options } = job.data
      await this.processFile(fileId, operation, options)
    })

    // RabbitMQ Consumer
    rabbitMQManager.consumeMessage(
      RABBITMQ_CONFIG.QUEUES.FILE_PROCESS,
      async (fileMessage: any) => {
        const { fileId, operation, options } = fileMessage
        await this.processFile(fileId, operation, options)
      },
    )
  }

  private async processFile(fileId: string, operation: string, options: any = {}): Promise<void> {
    // File processing logic buraya gelecek
    console.log(`Processing file ${fileId} with operation ${operation}`)

    // Simulated processing
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  /**
   * File processing job'ı ekler
   */
  public async processFileJob(
    fileId: string,
    operation: string,
    options: any = {},
    jobOptions: any = {},
  ): Promise<void> {
    // BullMQ ile job ekle
    await queueManager.addJob(
      QUEUE_NAMES.FILE_PROCESSING,
      'process-file',
      { fileId, operation, options },
      jobOptions,
    )

    // RabbitMQ ile de gönder (backup)
    await rabbitMQManager.publishMessage(
      RABBITMQ_CONFIG.EXCHANGES.FILES,
      RABBITMQ_CONFIG.ROUTING_KEYS.FILE_PROCESS,
      { fileId, operation, options },
    )
  }
}

// Singleton instances
export const emailQueueService = EmailQueueService.getInstance()
export const notificationQueueService = NotificationQueueService.getInstance()
export const fileProcessingQueueService = FileProcessingQueueService.getInstance()
