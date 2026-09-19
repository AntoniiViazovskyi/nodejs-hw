import nodemailer from 'nodemailer';

const transportOptions =
  process.env.NODE_ENV === 'test'
    ? { jsonTransport: true }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

const transporter = nodemailer.createTransport(transportOptions);

export const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};
