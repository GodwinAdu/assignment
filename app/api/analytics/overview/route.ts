import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import{ User} from '@/models/User';
import {Attendance} from '@/models/Attendance';
import{ Leave} from '@/models/Leave';
import {Performance} from '@/models/Performance';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
    });

    const todayAbsent = totalEmployees - todayAttendance;

    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({
      status: 'pending',
    });

    // Monthly attendance rate
    const monthlyRecords = await Attendance.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const expectedAttendance = totalEmployees * 22; // ~22 working days
    const attendanceRate =
      expectedAttendance > 0
        ? ((monthlyRecords / expectedAttendance) * 100).toFixed(2)
        : 0;

    // Top performers
    const topPerformers = await Performance.find()
      .sort({ overallScore: -1 })
      .limit(5)
      .populate('userId', 'name email department');

    // Department-wise breakdown
    const departments = await User.aggregate([
      { $match: { role: 'employee' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Attendance trend (last 7 days)
    const attendanceTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setHours(23, 59, 59, 999);

      const count = await Attendance.countDocuments({
        date: { $gte: date, $lte: nextDate },
      });

      attendanceTrend.push({
        date: date.toISOString().split('T')[0],
        present: count,
        absent: totalEmployees - count,
      });
    }

    return NextResponse.json(
      {
        totalEmployees,
        todayAttendance,
        todayAbsent,
        pendingLeaves,
        attendanceRate: parseFloat(attendanceRate as string),
        topPerformers,
        departments,
        attendanceTrend,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
