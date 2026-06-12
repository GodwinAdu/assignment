import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all performance records with user info
    const performances = await Performance.find().sort({ overallScore: -1 }).lean();
    const userIds = performances.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName email department').lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const performanceData = performances.map((perf, idx) => {
      const user = userMap.get(perf.userId.toString());
      return {
        userId: perf.userId,
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user?.email || '',
        department: user?.department || 'N/A',
        daysPresent: perf.daysPresent,
        daysPresentOnTime: perf.daysPresentOnTime,
        daysLate: perf.daysLate,
        daysAbsent: perf.daysAbsent,
        totalHoursWorked: perf.totalHoursWorked,
        expectedHours: perf.expectedHours,
        metrics: {
          attendanceRate: perf.attendanceRate,
          hoursWorkedScore: perf.hoursWorkedScore,
          punctualityScore: perf.punctualityScore,
          overallScore: perf.overallScore,
        },
        rank: perf.rank || idx + 1,
      };
    });

    // Calculate averages
    const count = performanceData.length || 1;
    const avgPerformance = {
      score: Math.round(performanceData.reduce((sum, p) => sum + p.metrics.overallScore, 0) / count),
      attendance: Math.round(performanceData.reduce((sum, p) => sum + p.metrics.attendanceRate, 0) / count),
      punctuality: Math.round(performanceData.reduce((sum, p) => sum + p.metrics.punctualityScore, 0) / count),
    };

    return NextResponse.json({
      employees: performanceData,
      averages: avgPerformance,
    });
  } catch (error) {
    console.error('[v0] Admin performance error:', error);
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}
