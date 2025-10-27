import nodemailer from 'nodemailer'

/**
 * Email gönderme fonksiyonu
 */
export const sendMail = async (
  to: string,
  subject: string,
  template: string,
  data: any = {},
): Promise<void> => {
  try {
    // SMTP transporter oluştur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email template'ini işle (basit implementation)
    let html = template
    Object.keys(data).forEach(key => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key])
    })

    // Email gönder
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
    })

    console.log(`Email sent to ${to}: ${subject}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
