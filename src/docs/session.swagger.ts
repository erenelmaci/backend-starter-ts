/**
 * @swagger
 * tags:
 *   name: Session Management
 *   description: Session yönetimi ve güvenlik
 */

/**
 * @swagger
 * /api/sessions/stats:
 *   get:
 *     summary: Session istatistikleri
 *     tags: [Session Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session istatistikleri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSessions:
 *                   type: number
 *                   description: Toplam aktif session sayısı
 *                 activeUsers:
 *                   type: number
 *                   description: Aktif kullanıcı sayısı
 *                 redisConnected:
 *                   type: boolean
 *                   description: Redis bağlantı durumu
 *       401:
 *         description: Yetkisiz erişim
 */

/**
 * @swagger
 * /api/sessions/user/{userId}/count:
 *   get:
 *     summary: Kullanıcının aktif session sayısı
 *     tags: [Session Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Session sayısı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 sessionCount:
 *                   type: number
 *       401:
 *         description: Yetkisiz erişim
 */

/**
 * @swagger
 * /api/sessions/user/{userId}/sessions:
 *   get:
 *     summary: Kullanıcının aktif session'ları
 *     tags: [Session Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Aktif session'lar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Yetkisiz erişim
 */

/**
 * @swagger
 * /api/sessions/user/{userId}/sessions:
 *   delete:
 *     summary: Kullanıcının tüm session'larını geçersiz kıl
 *     tags: [Session Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Tüm session'lar geçersiz kılındı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Yetkisiz erişim
 */
