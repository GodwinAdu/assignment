import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Attendance } from '@/models/Attendance';

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

    const month = request.nextUrl.searchParams.get('month'); // YYYY-MM format

    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, m] = month.split('-').map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 0, 23, 59, 59, 999);
    } else {
      // Default: current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const records = await Attendance.find({
      userId: decoded.userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 }).lean();

    const attendanceRecords = records.map((record) => {
      const dateObj = new Date(record.date);
      return {
        id: record._id,
        date: dateObj.toISOString().split('T')[0],
        day: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        checkIn: record.checkInTime
          ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '-',
        checkOut: record.checkOutTime
          ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '-',
        hoursWorked: record.hoursWorked || 0,
        status: record.status || 'present',
      };
    });

    // Stats
    const daysPresent = records.filter((r) => r.status === 'present').length;
    const daysLate = records.filter((r) => r.status === 'late').length;
    const daysAbsent = records.filter((r) => r.status === 'absent').length;
    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const avgHours = records.length > 0 ? (totalHours / records.length).toFixed(1) : '0';

    return NextResponse.json({
      records: attendanceRecords,
      stats: {
        daysPresent: daysPresent + daysLate,
        daysAbsent,
        daysLate,
        avgHours,
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error('[v0] Employee attendance history error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
