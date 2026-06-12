import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { sendEmail, generateInvitationEmail } from '@/lib/email';
import { verifyAccessToken } from '@/lib/jwt';
import crypto from 'crypto';
import { z } from 'zod';
import { AuditLog } from '@/models/AuditLog';

const inviteEmployeeSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  department: z.string().optional(),
  designation: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin access
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite employees' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = inviteEmployeeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, department, designation } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create user with invitation token
    const newUser = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      department: department || '',
      designation: designation || '',
      role: 'employee',
      isVerified: false,
      isActive: true,
      invitationToken,
      invitationTokenExpiry: tokenExpiry,
      password: crypto.randomBytes(16).toString('hex'), // Placeholder password
    });

    await newUser.save();

    // Create invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/accept-invitation?token=${invitationToken}&email=${encodeURIComponent(email)}`;

    // Get admin user for email
    const admin = await User.findById(payload.userId);

    // Send invitation email
    const emailSent = await sendEmail({
      to: newUser.email,
      subject: 'Welcome to Smart Attendance System',
      html: generateInvitationEmail(firstName, invitationLink, admin?.firstName || 'Admin'),
    });

    if (!emailSent) {
      // Delete the created user if email fails
      await User.findByIdAndDelete(newUser._id);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    // Log audit
    await AuditLog.create({
      userId: payload.userId,
      action: `Invited employee: ${email}`,
      actionType: 'create',
      resourceType: 'Employee',
      resourceId: newUser._id,
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    console.log('[v0] Invitation sent to:', email);
    return NextResponse.json(
      {
        message: 'Invitation sent successfully',
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Invite employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
