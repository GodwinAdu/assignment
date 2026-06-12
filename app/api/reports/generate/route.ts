import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { generatePDF, generateExcel } from '@/lib/report';
import { User } from '@/models/User';
import { Attendance } from '@/models/Attendance';
import { Performance } from '@/models/Performance';
import { z } from 'zod';

const ReportSchema = z.object({
  type: z.enum(['pdf', 'excel']),
  month: z.string().optional(),
  department: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = ReportSchema.parse(body);

    // Get month data
    const now = new Date();
    const month = validated.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // Get employees
    const query: any = { role: 'employee' };
    if (validated.department) {
      query.department = validated.department;
    }

    const employees = await User.find(query).sort({ firstName: 1 });

    // Get performance data
    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        const attendanceCount = await Attendance.countDocuments({
          userId: emp._id,
          date: { $gte: startDate, $lte: endDate },
        });

        const performance = await Performance.findOne({ userId: emp._id });

        return {
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          department: emp.department || 'N/A',
          attendance: attendanceCount,
          hoursWorked: performance?.totalHoursWorked || 0,
          punctuality: performance?.punctualityScore || 0,
          score: performance?.overallScore || 0,
        };
      })
    );

    // Calculate summary
    const totalAttendance = employeeData.reduce((sum, e) => sum + e.attendance, 0);
    const expectedDays = employees.length * 22; // ~22 working days
    const summary = {
      totalEmployees: employees.length,
      presentDays: totalAttendance,
      absentDays: expectedDays - totalAttendance,
      attendanceRate: expectedDays > 0 ? (totalAttendance / expectedDays) * 100 : 0,
      averageScore:
        employeeData.length > 0
          ? employeeData.reduce((sum, e) => sum + e.score, 0) / employeeData.length
          : 0,
    };

    const reportData = {
      title: `Attendance & Performance Report - ${month}`,
      month,
      employees: employeeData,
      summary,
    };

    let buffer: Buffer;
    let mimeType: string;
    let filename: string;

    if (validated.type === 'pdf') {
      buffer = generatePDF(reportData);
      mimeType = 'application/pdf';
      filename = `report-${month}.pdf`;
    } else {
      buffer = generateExcel(reportData);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `report-${month}.xlsx`;
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[v0] Report generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
