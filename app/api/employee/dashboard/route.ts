import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Attendance } from '@/models/Attendance';
import { Leave } from '@/models/Leave';
import { Performance } from '@/models/Performance';
import { User } from '@/models/User';

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

    const user = await User.findById(decoded.userId).select('firstName lastName department');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      userId: decoded.userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean();

    // Monthly stats
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyRecords = await Attendance.find({
      userId: decoded.userId,
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    const monthlyStats = {
      present: monthlyRecords.filter(r => r.status === 'present').length,
      late: monthlyRecords.filter(r => r.status === 'late').length,
      absent: monthlyRecords.filter(r => r.status === 'absent').length,
      totalHours: Math.round(monthlyRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) * 10) / 10,
      totalDays: monthlyRecords.length,
    };

    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({
      userId: decoded.userId,
      status: 'pending',
    });

    // Last 7 days attendance (for weekly chart)
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const record = await Attendance.findOne({
        userId: decoded.userId,
        date: { $gte: date, $lt: nextDate },
      }).lean();

      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        hours: record?.hoursWorked || 0,
        status: record?.status || 'absent',
      });
    }

    // Last 5 attendance records
    const recentAttendance = await Attendance.find({
      userId: decoded.userId,
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Performance data
    const performance = await Performance.findOne({
      userId: decoded.userId,
    }).lean();

    return NextResponse.json({
      user: {
        name: `${user.firstName} ${user.lastName}`,
        department: user.department,
      },
      today: todayAttendance ? {
        checkInTime: todayAttendance.checkInTime,
        checkOutTime: todayAttendance.checkOutTime,
        hoursWorked: todayAttendance.hoursWorked,
        status: todayAttendance.status,
      } : null,
      monthlyStats,
      pendingLeaves,
      weekData,
      recentAttendance: recentAttendance.map(r => ({
        date: r.date,
        checkIn: r.checkInTime,
        checkOut: r.checkOutTime,
        hours: r.hoursWorked || 0,
        status: r.status,
      })),
      performance: performance ? {
        attendanceRate: performance.attendanceRate,
        hoursWorkedScore: performance.hoursWorkedScore,
        punctualityScore: performance.punctualityScore,
        overallScore: performance.overallScore,
        rank: performance.rank,
      } : null,
    });
  } catch (error) {
    console.error('[v0] Employee dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
