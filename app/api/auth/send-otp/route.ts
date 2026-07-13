import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { generateOTP, storeOTP } from '@/lib/otp';
import { sendEmail, generateOTPEmail } from '@/lib/email';
import { z } from 'zod';

const sendOtpSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = validation.data;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'User is already verified' }, { status: 400 });
    }

    const otp = generateOTP(6);
    storeOTP(user.email, otp, 10);

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Your email verification code',
      html: generateOTPEmail(otp, `${user.firstName}`),
    });

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    console.log('[v0] Resent verification OTP to:', user.email);
    return NextResponse.json({ message: 'OTP resent successfully' }, { status: 200 });
  } catch (error) {
    console.error('[v0] Resend OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
