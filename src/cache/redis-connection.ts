import Redis from 'ioredis';

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Redis connection already exists');
      return;
    }

    try {
      const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';

      this.client = new Redis(redisUri, {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError: err => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      this.client.on('connect', () => {
        console.log('Redis connection successful');
        this.isConnected = true;
      });

      this.client.on('error', error => {
        console.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis reconnecting...');
      });

      await this.client.ping();
    } catch (error) {
      console.error('Failed to initialize Redis connection:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      console.log('Redis connection closed');
    }
  }

  public getClient(): Redis {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis connection is not available');
    }
    return this.client;
  }

  public isRedisConnected(): boolean {
    return this.isConnected;
  }
}

export const redisConnection = RedisConnection.getInstance();
