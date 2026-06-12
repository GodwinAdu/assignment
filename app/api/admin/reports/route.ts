import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { User } from '@/models/User';
import { Attendance } from '@/models/Attendance';
import { Leave } from '@/models/Leave';
import { Performance } from '@/models/Performance';

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

    const month = request.nextUrl.searchParams.get('month') || 
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Attendance summary
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
    
    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const onLeaveCount = attendanceRecords.filter(r => r.status === 'leave').length;
    const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const avgHours = attendanceRecords.length > 0 ? (totalHours / attendanceRecords.length).toFixed(1) : '0';

    // Department breakdown
    const employees = await User.find({ role: 'employee', isActive: true }).lean();
    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    
    const departmentData = await Promise.all(departments.map(async (dept) => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptIds = deptEmployees.map(e => e._id.toString());
      const deptAttendance = attendanceRecords.filter(r => deptIds.includes(r.userId.toString()));
      const deptPresent = deptAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
      const deptTotal = deptAttendance.length || 1;
      const deptHours = deptAttendance.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);

      return {
        department: dept,
        employees: deptEmployees.length,
        records: deptTotal,
        hours: Math.round(deptHours * 10) / 10,
        attendanceRate: Math.round((deptPresent / deptTotal) * 100),
      };
    }));

    // Leave summary
    const leaveRecords = await Leave.find({
      startDate: { $gte: startDate, $lte: endDate },
    }).lean();

    const leaveSummary = {
      approved: leaveRecords.filter(l => l.status === 'approved').length,
      pending: leaveRecords.filter(l => l.status === 'pending').length,
      rejected: leaveRecords.filter(l => l.status === 'rejected').length,
    };

    // Top performers
    const performances = await Performance.find()
      .sort({ overallScore: -1 })
      .limit(10)
      .lean();
    
    const perfUserIds = performances.map(p => p.userId);
    const perfUsers = await User.find({ _id: { $in: perfUserIds } }).select('firstName lastName department').lean();
    const perfUserMap = new Map(perfUsers.map(u => [u._id.toString(), u]));

    const topPerformers = performances.map((p, idx) => {
      const user = perfUserMap.get(p.userId.toString());
      return {
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        department: user?.department || 'N/A',
        score: p.overallScore,
        rank: idx + 1,
      };
    });

    // Attendance breakdown for charts
    const attendanceBreakdown = {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      onLeave: onLeaveCount,
    };

    return NextResponse.json({
      month,
      monthLabel: new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      summary: {
        totalEmployees,
        totalRecords: attendanceRecords.length,
        presentDays: presentCount,
        lateDays: lateCount,
        absentDays: absentCount,
        onLeave: onLeaveCount,
        totalHours: Math.round(totalHours * 10) / 10,
        avgDailyHours: avgHours,
      },
      attendanceBreakdown,
      departmentData,
      leaveSummary,
      topPerformers,
    });
  } catch (error) {
    console.error('[v0] Report data error:', error);
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 });
  }
}
