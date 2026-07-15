import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Smart Attendance Tracker 🎉",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now log in and manage your attendance.</p>
      <p>Thank you for joining!</p>
    `,
  });
}