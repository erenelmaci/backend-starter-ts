import amqp, { Connection, Channel } from 'amqplib'

export class RabbitMQManager {
  private static instance: RabbitMQManager
  private connection: Connection | null = null
  private channel: Channel | null = null
  private isConnected = false

  private constructor() {}

  public static getInstance(): RabbitMQManager {
    if (!RabbitMQManager.instance) {
      RabbitMQManager.instance = new RabbitMQManager()
    }
    return RabbitMQManager.instance
  }

  /**
   * RabbitMQ'ya bağlanır
   */
  public async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

      this.connection = (await amqp.connect(rabbitmqUrl)) as any
      this.channel = await (this.connection as any).createChannel()

      this.isConnected = true

      console.log('✅ RabbitMQ connected successfully')

      // Connection event listeners
      if (this.connection) {
        this.connection.on('error', err => {
          console.error('RabbitMQ connection error:', err)
          this.isConnected = false
        })

        this.connection.on('close', () => {
          console.log('RabbitMQ connection closed')
          this.isConnected = false
        })
      }
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error)
      throw error
    }
  }

  /**
   * Bağlantıyı kapatır
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close()
        this.channel = null
      }

      if (this.connection) {
        await (this.connection as any).close()
        this.connection = null
      }

      this.isConnected = false
      console.log('✅ RabbitMQ disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error)
    }
  }

  /**
   * Bağlantı durumunu kontrol eder
   */
  public isRabbitMQConnected(): boolean {
    return this.isConnected && this.connection !== null && this.channel !== null
  }

  /**
   * Exchange oluşturur
   */
  public async createExchange(
    exchangeName: string,
    type: 'direct' | 'topic' | 'fanout' | 'headers' = 'direct',
    options: any = {},
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    await this.channel.assertExchange(exchangeName, type, {
      durable: true,
      ...options,
    })
  }

  /**
   * Queue oluşturur
   */
  public async createQueue(queueName: string, options: any = {}): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    await this.channel.assertQueue(queueName, {
      durable: true,
      ...options,
    })
  }

  /**
   * Queue'yu exchange'e bağlar
   */
  public async bindQueue(
    queueName: string,
    exchangeName: string,
    routingKey: string = '',
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    await this.channel.bindQueue(queueName, exchangeName, routingKey)
  }

  /**
   * Mesaj gönderir
   */
  public async publishMessage(
    exchangeName: string,
    routingKey: string,
    message: any,
    options: any = {},
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    const messageBuffer = Buffer.from(JSON.stringify(message))

    return this.channel.publish(exchangeName, routingKey, messageBuffer, {
      persistent: true,
      ...options,
    })
  }

  /**
   * Queue'ya mesaj gönderir
   */
  public async sendToQueue(queueName: string, message: any, options: any = {}): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    const messageBuffer = Buffer.from(JSON.stringify(message))

    return this.channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
      ...options,
    })
  }

  /**
   * Mesaj dinler
   */
  public async consumeMessage(
    queueName: string,
    callback: (message: any) => Promise<void>,
    options: any = {},
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    await this.channel.consume(
      queueName,
      async msg => {
        if (msg) {
          try {
            const messageData = JSON.parse(msg.content.toString())
            await callback(messageData)
            this.channel!.ack(msg)
          } catch (error) {
            console.error('Error processing message:', error)
            this.channel!.nack(msg, false, false) // Don't requeue
          }
        }
      },
      {
        noAck: false,
        ...options,
      },
    )
  }

  /**
   * Queue'daki mesaj sayısını döndürür
   */
  public async getQueueMessageCount(queueName: string): Promise<number> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    const queueInfo = await this.channel.checkQueue(queueName)
    return queueInfo.messageCount
  }

  /**
   * Queue'yu temizler
   */
  public async purgeQueue(queueName: string): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    await this.channel.purgeQueue(queueName)
  }

  /**
   * Queue'yu siler
   */
  public async deleteQueue(queueName: string): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available')
    }

    await this.channel.deleteQueue(queueName)
  }
}

// Singleton instance
export const rabbitMQManager = RabbitMQManager.getInstance()

// Predefined exchanges and queues
export const RABBITMQ_CONFIG = {
  EXCHANGES: {
    NOTIFICATIONS: 'notifications.exchange',
    EMAILS: 'emails.exchange',
    FILES: 'files.exchange',
  },
  QUEUES: {
    EMAIL_SEND: 'email.send.queue',
    EMAIL_TEMPLATE: 'email.template.queue',
    NOTIFICATION_PUSH: 'notification.push.queue',
    FILE_UPLOAD: 'file.upload.queue',
    FILE_PROCESS: 'file.process.queue',
  },
  ROUTING_KEYS: {
    EMAIL_SEND: 'email.send',
    EMAIL_TEMPLATE: 'email.template',
    NOTIFICATION_PUSH: 'notification.push',
    FILE_UPLOAD: 'file.upload',
    FILE_PROCESS: 'file.process',
  },
} as const
