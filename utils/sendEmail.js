const { createTransport } = require("nodemailer");

const sendEmail = async (to, subject, message) => {
  const transporter = createTransport({
    service: process.env.SERVICE_NAME,
    host: process.env.SERVICE_HOST,
    port: process.env.SERVICE_PORT,
    secure: process.env.SERVICE_SECURE,
    auth: {
      user: process.env.SERVICE_AUTH_USER,
      pass: process.env.SERVICE_AUTH_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SERVICE_AUTH_USER,
    to,
    subject,
    text: message,
  });
};

module.exports = { sendEmail };
