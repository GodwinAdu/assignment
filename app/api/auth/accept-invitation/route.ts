import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { hashPassword } from '@/lib/bcrypt';
import { generateOTP, storeOTP } from '@/lib/otp';
import { sendEmail, generateOTPEmail } from '@/lib/email';
import { z } from 'zod';

const acceptInvitationSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = acceptInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { token, email, password } = validation.data;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 400 }
      );
    }

    // Verify token
    if (user.invitationToken !== token) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (!user.invitationTokenExpiry || new Date() > user.invitationTokenExpiry) {
      return NextResponse.json(
        { error: 'Invitation link has expired' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Update user with password and clear invitation token
    user.password = hashedPassword;
    user.invitationToken = undefined;
    user.invitationTokenExpiry = undefined;
    await user.save();

    // Generate and send OTP
    const otp = generateOTP(6);
    storeOTP(email, otp);

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Email Verification - OTP',
      html: generateOTPEmail(otp, user.firstName),
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    console.log('[v0] Invitation accepted by:', email);
    return NextResponse.json(
      {
        message: 'Password set successfully. OTP sent to your email.',
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
