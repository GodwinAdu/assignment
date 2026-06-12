import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Attendance } from '@/models/Attendance';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const date = request.nextUrl.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = request.nextUrl.searchParams.get('status');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all attendance records for the date
    const query: any = { date: { $gte: startOfDay, $lte: endOfDay } };
    if (status && status !== 'all') {
      query.status = status;
    }

    const records = await Attendance.find(query).lean();

    // Get all employees
    const employees = await User.find({ role: 'employee' }).select('firstName lastName').lean();
    const employeeMap = new Map(employees.map((e) => [e._id.toString(), e]));

    // Build attendance data with employee names
    const attendanceRecords = records.map((record) => {
      const emp = employeeMap.get(record.userId.toString());
      return {
        id: record._id,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
        date: record.date.toISOString().split('T')[0],
        checkInTime: record.checkInTime
          ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          : '-',
        checkOutTime: record.checkOutTime
          ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
          : '-',
        status: record.status || 'present',
        hoursWorked: record.hoursWorked || 0,
      };
    });

    // Summary counts
    const totalEmployees = employees.length;
    const presentCount = records.filter((r) => r.status === 'present').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const absentCount = totalEmployees - records.length;

    return NextResponse.json({
      records: attendanceRecords,
      summary: {
        present: presentCount + lateCount,
        absent: absentCount,
        late: lateCount,
        total: totalEmployees,
      },
    });
  } catch (error) {
    console.error('[v0] Admin attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
