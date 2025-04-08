"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisConnection {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }
    static getInstance() {
        if (!RedisConnection.instance) {
            RedisConnection.instance = new RedisConnection();
        }
        return RedisConnection.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected) {
                console.log('Redis connection already exists');
                return;
            }
            try {
                const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';
                this.client = new ioredis_1.default(redisUri, {
                    retryStrategy: (times) => {
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
                yield this.client.ping();
            }
            catch (error) {
                console.error('Failed to initialize Redis connection:', error);
                throw error;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                yield this.client.quit();
                this.client = null;
                this.isConnected = false;
                console.log('Redis connection closed');
            }
        });
    }
    getClient() {
        if (!this.client || !this.isConnected) {
            throw new Error('Redis connection is not available');
        }
        return this.client;
    }
    isRedisConnected() {
        return this.isConnected;
    }
}
exports.redisConnection = RedisConnection.getInstance();
