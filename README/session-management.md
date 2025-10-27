# 🔐 Session Management & Security

Bu backend starter template'i, production-ready session yönetimi ve güvenlik özellikleri içerir.

## 🚀 **Özellikler**

### **1. Redis Persistence**

- ✅ Session'lar disk'e persist edilir
- ✅ Container restart'ta session'lar korunur
- ✅ Sunucu değişikliğinde session'lar kaybolmaz

### **2. Session Hijacking Koruması**

- ✅ User-Agent kontrolü
- ✅ IP adresi takibi
- ✅ Şüpheli aktivite tespiti
- ✅ Otomatik session geçersizleştirme

### **3. Multi-Session Yönetimi**

- ✅ Kullanıcı başına birden fazla session
- ✅ Session sayısı takibi
- ✅ Toplu session geçersizleştirme
- ✅ Session istatistikleri

### **4. Admin Panel**

- ✅ Session istatistikleri
- ✅ Kullanıcı session yönetimi
- ✅ Toplu logout işlemleri

## 📋 **API Endpoints**

### **Session İstatistikleri**

```bash
GET /api/sessions/stats
# Response: { totalSessions, activeUsers, redisConnected }
```

### **Kullanıcı Session Sayısı**

```bash
GET /api/sessions/user/{userId}/count
# Response: { userId, sessionCount }
```

### **Kullanıcı Session'ları**

```bash
GET /api/sessions/user/{userId}/sessions
# Response: { userId, sessions: [token1, token2, ...] }
```

### **Tüm Session'ları Geçersiz Kıl**

```bash
DELETE /api/sessions/user/{userId}/sessions
# Response: { message: "All sessions invalidated for user {userId}" }
```

## 🔧 **Docker Konfigürasyonu**

### **Redis Persistence**

```yaml
redis:
  image: redis:7.0-alpine
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes --appendfsync everysec

volumes:
  redis_data:
```

### **Avantajlar**

- ✅ **Container Restart**: Session'lar korunur
- ✅ **Sunucu Değişikliği**: Volume mount ile taşınabilir
- ✅ **Backup**: Redis dump dosyaları otomatik oluşur
- ✅ **Recovery**: Crash sonrası session'lar geri yüklenir

## 🛡️ **Güvenlik Özellikleri**

### **1. Session Hijacking Koruması**

```typescript
// User-Agent değişikliği tespit edilir
if (userAgent && session.userAgent !== userAgent) {
  console.warn(`Session hijacking attempt detected`)
  await invalidateSession(token)
  return null
}
```

### **2. IP Takibi**

```typescript
// IP değişikliği uyarı verir
if (ip && session.ip !== ip && session.ip !== 'unknown') {
  console.warn(`IP mismatch detected for user ${session.userId}`)
}
```

### **3. Rate Limiting**

```typescript
// Auth endpoint'leri için rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 5 deneme
  message: 'Too many login attempts',
})
```

## 📊 **Session Monitoring**

### **Real-time İstatistikler**

```typescript
const stats = await getSessionStats()
// {
//   totalSessions: 150,
//   activeUsers: 45,
//   redisConnected: true
// }
```

### **Kullanıcı Bazlı Takip**

```typescript
const userSessions = await getUserSessions(userId)
const sessionCount = await getUserSessionCount(userId)
```

## 🔄 **Deployment Senaryoları**

### **1. Container Restart**

```bash
docker-compose restart backend
# ✅ Session'lar korunur
# ✅ Kullanıcılar logout olmaz
```

### **2. Sunucu Değişikliği**

```bash
# Yeni sunucuya deploy
docker-compose up -d
# ✅ Redis volume mount ile session'lar taşınır
# ✅ Kullanıcılar logout olmaz
```

### **3. Redis Crash Recovery**

```bash
# Redis crash sonrası
docker-compose restart redis
# ✅ AOF dosyasından session'lar geri yüklenir
# ✅ Kullanıcılar logout olmaz
```

## 🚨 **Production Önerileri**

### **1. Redis Cluster**

```yaml
# Production için Redis Cluster
redis-cluster:
  image: redis:7.0-alpine
  command: redis-server --cluster-enabled yes
```

### **2. Session Cleanup**

```typescript
// Expired session'ları temizle
setInterval(async () => {
  await cleanupExpiredSessions()
}, 3600000) // 1 saat
```

### **3. Monitoring**

```typescript
// Session health check
app.get('/health/sessions', async (req, res) => {
  const stats = await getSessionStats()
  res.json({ healthy: stats.redisConnected })
})
```

## 📈 **Performance**

### **Redis Optimizasyonları**

- ✅ **AOF**: Her saniye disk'e yazma
- ✅ **Memory**: Session'lar için optimize edilmiş
- ✅ **Expiry**: Otomatik TTL yönetimi
- ✅ **Cleanup**: Expired session'lar otomatik silinir

### **Session Yönetimi**

- ✅ **Lazy Loading**: Session'lar ihtiyaç halinde yüklenir
- ✅ **Caching**: Aktif session'lar memory'de tutulur
- ✅ **Batch Operations**: Toplu işlemler optimize edilmiş

## 🔍 **Debugging**

### **Session Logları**

```typescript
// Session oluşturma
console.log(`Session created for user ${sessionData.userId}`)

// Session hijacking
console.warn(`Session hijacking attempt detected for user ${session.userId}`)

// IP değişikliği
console.warn(`IP mismatch detected for user ${session.userId}`)
```

### **Redis Monitoring**

```bash
# Redis CLI ile session kontrolü
redis-cli
> KEYS auth:*
> GET auth:token123
> SCARD user_sessions:userId123
```

## 🎯 **Sonuç**

Bu session yönetimi sistemi ile:

- ✅ **Production Ready**: Gerçek dünya senaryolarına hazır
- ✅ **Güvenli**: Session hijacking koruması
- ✅ **Scalable**: Redis cluster desteği
- ✅ **Reliable**: Crash recovery ve persistence
- ✅ **Monitorable**: Detaylı istatistikler ve loglar

**Artık container restart veya sunucu değişikliğinde kullanıcılar sistemden atılmayacak!** 🚀
