import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { hashPassword } from '@/lib/bcrypt';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { z } from 'zod';
import dns from 'dns';
import { generateOTP, storeOTP } from '@/lib/otp';
import { sendEmail, generateOTPEmail } from '@/lib/email';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Verify domain has MX records (basic check for receiving mail servers)
    const domain = email.split('@')[1];
    try {
      const mxRecords = await dns.promises.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json({ error: 'Email domain is not valid' }, { status: 400 });
      }
    } catch (err) {
      console.error('[v0] MX lookup failed for domain:', domain, err);
      return NextResponse.json({ error: 'Email domain is not valid' }, { status: 400 });
    }

    // Create user in unverified state until OTP is confirmed
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: 'employee',
      isVerified: false,
    });

    await user.save();

    const otp = generateOTP(6);
    storeOTP(user.email, otp, 10);

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: generateOTPEmail(otp, `${user.firstName}`),
    });

    if (!emailSent) {
      await User.deleteOne({ _id: user._id });
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    console.log('[v0] User registered (OTP sent):', user.email);
    return NextResponse.json(
      { message: 'User registered. OTP sent to email for verification.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
