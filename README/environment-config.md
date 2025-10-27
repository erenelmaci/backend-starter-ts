# 🔧 Environment Configuration

Bu backend starter template'i için gerekli environment dosyalarını oluşturun.

## 📁 **Environment Dosyaları**

### **1. .env.development**

```bash
# Environment Configuration
NODE_ENV=development
PORT=8000
ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/backend-starter-dev
MONGODB_TEST_URI=mongodb://localhost:27017/backend-starter-test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ORIGIN=localhost:3000,127.0.0.1:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this-in-production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
S3_PROFILE_IMAGES_PATH=/profiles
S3_DOCUMENTS_PATH=/documents

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5
RATE_LIMIT_FILE_UPLOAD_MAX_REQUESTS=10

# API Configuration
API_URL=http://localhost:8000
API_VERSION=v1
API_PREFIX=/api

# Monitoring Configuration
ENABLE_MONITORING=true
MONITORING_PORT=9090

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000

# Queue Configuration
QUEUE_CONCURRENCY=5
QUEUE_MAX_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=2000

# Cronjob Configuration
ENABLE_CRONJOBS=true
CLEANUP_INTERVAL=86400000
SESSION_CLEANUP_INTERVAL=3600000

# Development Specific
DEBUG=true
VERBOSE_LOGGING=true
HOT_RELOAD=true
```

### **2. .env.production**

```bash
# Environment Configuration
NODE_ENV=production
PORT=8000
ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/backend-starter-prod
MONGODB_TEST_URI=mongodb://localhost:27017/backend-starter-test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=your-rabbitmq-user
RABBITMQ_PASSWORD=your-rabbitmq-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ORIGIN=yourdomain.com,www.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-this-in-production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
S3_PROFILE_IMAGES_PATH=/profiles
S3_DOCUMENTS_PATH=/documents

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5
RATE_LIMIT_FILE_UPLOAD_MAX_REQUESTS=10

# API Configuration
API_URL=https://api.yourdomain.com
API_VERSION=v1
API_PREFIX=/api

# Monitoring Configuration
ENABLE_MONITORING=true
MONITORING_PORT=9090

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000

# Queue Configuration
QUEUE_CONCURRENCY=10
QUEUE_MAX_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=2000

# Cronjob Configuration
ENABLE_CRONJOBS=true
CLEANUP_INTERVAL=86400000
SESSION_CLEANUP_INTERVAL=3600000

# Production Specific
DEBUG=false
VERBOSE_LOGGING=false
HOT_RELOAD=false
```

## 🚀 **Kurulum**

### **1. Environment Dosyalarını Oluşturun**

```bash
# Development için
cp .env.example .env.development

# Production için
cp .env.example .env.production
```

### **2. Değerleri Güncelleyin**

- Database connection string'lerini
- Redis ve RabbitMQ bilgilerini
- JWT secret'larını
- AWS S3 credentials'larını
- Email SMTP bilgilerini

### **3. Güvenlik**

- Production'da güçlü password'ler kullanın
- JWT secret'ları en az 32 karakter olsun
- Redis ve RabbitMQ için authentication aktif edin
- HTTPS kullanın

## 📋 **Environment Variables Açıklamaları**

### **Database**

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_TEST_URI`: Test database connection string

### **Redis**

- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `REDIS_PASSWORD`: Redis password (production'da gerekli)

### **RabbitMQ**

- `RABBITMQ_URL`: RabbitMQ connection URL
- `RABBITMQ_USERNAME`: RabbitMQ username
- `RABBITMQ_PASSWORD`: RabbitMQ password

### **JWT**

- `JWT_SECRET`: JWT signing secret (güçlü olmalı)
- `JWT_EXPIRES_IN`: Token expiry time
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiry time

### **CORS**

- `ORIGIN`: Allowed origins (comma separated)
- `ALLOWED_ORIGINS`: CORS allowed origins

### **Security**

- `BCRYPT_ROUNDS`: Password hashing rounds
- `SESSION_SECRET`: Session secret key

### **Email**

- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password

### **AWS S3**

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET`: S3 bucket name

### **Rate Limiting**

- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window
- `RATE_LIMIT_AUTH_MAX_REQUESTS`: Auth endpoint max requests

### **Queue**

- `QUEUE_CONCURRENCY`: Queue worker concurrency
- `QUEUE_MAX_ATTEMPTS`: Maximum job retry attempts
- `QUEUE_BACKOFF_DELAY`: Job retry delay

### **Cronjob**

- `ENABLE_CRONJOBS`: Enable/disable cronjobs
- `CLEANUP_INTERVAL`: Cleanup job interval
- `SESSION_CLEANUP_INTERVAL`: Session cleanup interval

## ⚠️ **Önemli Notlar**

1. **Production'da mutlaka güçlü password'ler kullanın**
2. **JWT secret'ları en az 32 karakter olsun**
3. **Redis ve RabbitMQ için authentication aktif edin**
4. **HTTPS kullanın**
5. **Environment dosyalarını .gitignore'a ekleyin**
6. **Sensitive bilgileri environment variables'da tutun**
7. **Production'da DEBUG=false yapın**
8. **Log level'ı production'da info yapın**
