const nodemailer = require("nodemailer");

const createTransport = () => {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransport();

const mailService = {
  sendMail: async ({ to, subject, text }) => {
    if (!transporter || !to) return;

    try {
      await transporter.sendMail({
        from: `"Aura Cut" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px;background:#faf8f4;border:1px solid #e8e0d0;">
            <h2 style="color:#b8922a;margin-bottom:8px;">Aura Cut</h2>
            <hr style="border:none;border-top:1px solid #e8e0d0;margin:16px 0;" />
            <p style="color:#1a1510;font-size:15px;line-height:1.7;">${text}</p>
            <hr style="border:none;border-top:1px solid #e8e0d0;margin:16px 0;" />
            <p style="color:#a89880;font-size:12px;">10 , Siliana, Tunisia</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("[mailService] Email failed:", err);
    }
  },
};

module.exports = mailService;