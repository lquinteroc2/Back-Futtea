import * as nodemailer from 'nodemailer';
import { EMAIL_PASS, EMAIL_USER } from 'src/config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: 'Código de Verificación',
    text: `Tu código es: ${code}`,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `http://www.andeanbeardigital.com/reset-password?token=${token}`;
  await transporter.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: 'Restablecimiento de contraseña',
    html: `
      <p>Haz clic en el enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>El enlace expira en 15 minutos.</p>
    `,
  });
};