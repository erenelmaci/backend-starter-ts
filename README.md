# Backend Starter Kit - User Guide

## Overview

This backend starter kit provides a robust foundation for building scalable Node.js applications. It comes pre-configured with essential features and best practices, making it an ideal starting point for enterprise-level projects.

## Key Features

- 🔐 **Authentication System**: JWT-based authentication with Redis session management
- 📧 **Email System**: Template-based email service with SMTP support
- 📁 **File System**: S3 bucket integration with presigned URL support
- 📨 **Notification System**: Real-time notifications with WebSocket support
- 📊 **Queue Management**: Bull MQ and RabbitMQ integration for background jobs
- 📝 **Logging System**: Comprehensive logging infrastructure
- 📚 **API Documentation**: Swagger/OpenAPI documentation
- 🐳 **Docker Support**: Ready-to-use Docker configuration

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- MongoDB
- Redis
- AWS S3 (for file storage)

### Installation

1. **Clone the repository**

```bash
git clone [repository-url]
cd backend-starter-ts
```

2. **Environment Setup**

```bash
# For development
cp .env.development .env

# For production
cp .env.production .env
```

3. **Install dependencies**

```bash
npm install
```

4. **Start the application**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Project Structure
