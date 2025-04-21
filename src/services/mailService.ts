import { createTransport } from 'nodemailer';

export const sendMail = async (to: string, subject: string, html: string) => {
  const transporter = createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });
};
