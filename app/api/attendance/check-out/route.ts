import { NextRequest, NextResponse } from 'next/server';
import { Attendance } from '@/models/Attendance';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { AuditLog } from '@/models/AuditLog';
import { z } from 'zod';

const checkOutSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user access
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = checkOutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { latitude, longitude } = validation.data;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId: payload.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: 'No check-in record found for today' },
        { status: 404 }
      );
    }

    if (attendance.checkOutTime) {
      return NextResponse.json(
        { error: 'Already checked out' },
        { status: 409 }
      );
    }

    // Update attendance with check-out
    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;
    attendance.checkOutLocation = latitude && longitude ? { latitude, longitude } : undefined;

    // Calculate hours worked
    if (attendance.checkInTime) {
      const hoursWorked = (checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);
      attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
    }

    await attendance.save();

    // Log audit
    await AuditLog.create({
      userId: payload.userId,
      action: 'Check-out',
      actionType: 'update',
      resourceType: 'Attendance',
      resourceId: attendance._id,
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    console.log('[v0] Check-out successful for user:', payload.userId);
    return NextResponse.json(
      {
        message: 'Check-out successful',
        checkOutTime: attendance.checkOutTime,
        hoursWorked: attendance.hoursWorked,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
