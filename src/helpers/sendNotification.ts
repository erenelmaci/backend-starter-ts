/**
 * Notification gönderme fonksiyonu
 */
export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'info',
  data: any = {},
): Promise<void> => {
  try {
    // Notification logic buraya gelecek
    // Şimdilik sadece log yazıyoruz
    console.log(`Notification sent to user ${userId}:`, {
      title,
      message,
      type,
      data,
      timestamp: new Date().toISOString(),
    })

    // Gerçek implementasyonda:
    // - WebSocket ile real-time notification
    // - Push notification (FCM, APNS)
    // - Email notification
    // - SMS notification
    // - Database'e kaydetme
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}
