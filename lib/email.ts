import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

console.log("EMAIL USER:", EMAIL_USER);
console.log("PASSWORD EXISTS:", EMAIL_PASSWORD.length > 0);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('[v0] Email sent to:', options.to);
    return true;
  } catch (error) {
    console.error('[v0] Error sending email:', error);
    return false;
  }
}

export function generateOTPEmail(otp: string, userName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0;">Verify Your Email</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <p>Hi ${userName},</p>
        <p>Your OTP verification code is:</p>
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="letter-spacing: 5px; color: #667eea; font-size: 32px; margin: 0;">${otp}</h2>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn&apos;t request this code, please ignore this email.</p>
      </div>
      <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #999; font-size: 12px; border-radius: 0 0 8px 8px;">
        <p>Smart Attendance System © 2024</p>
      </div>
    </div>
  `;
}

export function generateInvitationEmail(
  employeeName: string,
  invitationLink: string,
  adminName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0;">Welcome to Our Team</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <p>Hi ${employeeName},</p>
        <p>${adminName} has invited you to join the Smart Attendance System.</p>
        <p style="margin: 30px 0;">Click the link below to complete your registration:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${invitationLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="color: #666; font-size: 12px;">This link will expire in 7 days.</p>
      </div>
      <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #999; font-size: 12px; border-radius: 0 0 8px 8px;">
        <p>Smart Attendance System © 2024</p>
      </div>
    </div>
  `;
}

export function generatePasswordResetEmail(
  userName: string,
  resetLink: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
        <h1 style="margin: 0;">Password Reset Request</h1>
      </div>
      <div style="padding: 20px; background: #f9f9f9;">
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #666;">If you didn&apos;t request this, please ignore this email.</p>
      </div>
      <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #999; font-size: 12px; border-radius: 0 0 8px 8px;">
        <p>Smart Attendance System © 2024</p>
      </div>
    </div>
  `;
}
