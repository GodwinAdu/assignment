import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import {User} from '@/models/User';
import {Attendance} from '@/models/Attendance';
import {Leave} from '@/models/Leave';
import {Performance} from '@/models/Performance';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile
    const user = await User.findById(decoded.userId).select('-password -otp');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current month attendance
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthAttendance = await Attendance.countDocuments({
      userId: decoded.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Get pending leaves
    const pendingLeaves = await Leave.countDocuments({
      userId: decoded.userId,
      status: 'pending',
    });

    // Get approved leaves this month
    const approvedLeaves = await Leave.countDocuments({
      userId: decoded.userId,
      status: 'approved',
      startDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Get performance
    const performance = await Performance.findOne({ userId: decoded.userId });

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.findOne({
      userId: decoded.userId,
      date: { $gte: today, $lte: todayEnd },
    });

    return NextResponse.json(
      {
        user,
        attendance: {
          thisMonth: thisMonthAttendance,
          today: todayAttendance ? 'present' : 'absent',
          checkInTime: todayAttendance?.checkInTime,
          checkOutTime: todayAttendance?.checkOutTime,
        },
        leaves: {
          pending: pendingLeaves,
          approved: approvedLeaves,
        },
        performance: {
          score: performance?.overallScore || 0,
          rank: performance?.rank || 0,
          attendance: performance?.attendanceRate || 0,
          punctuality: performance?.punctualityScore || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    // Whitelist allowed fields
    const updates: Record<string, any> = {};
    if (body.firstName) updates.firstName = body.firstName;
    if (body.lastName) updates.lastName = body.lastName;
    if (body.phone !== undefined) updates.phone = body.phone;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('[v0] Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
