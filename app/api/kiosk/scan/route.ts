import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OfficeQR } from '@/models/OfficeQR';
import { QRScan } from '@/models/QRScan';
import { Attendance } from '@/models/Attendance';
import { User } from '@/models/User';
import { z } from 'zod';

const ScanSchema = z.object({
  qrToken: z.string(),
  employeeId: z.string(),
  action: z.enum(['check_in', 'check_out']),
  email: z.string().email().optional(), // Optional email verification
});

// POST: Handle kiosk QR scan check-in/out (public endpoint - no auth required)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = ScanSchema.parse(body);

    // Verify the QR token is active
    const qr = await OfficeQR.findOne({ qrToken: validated.qrToken, isActive: true });
    if (!qr) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code. Please contact your admin.' },
        { status: 400 }
      );
    }

    // Find the employee
    const employee = await User.findById(validated.employeeId);
    if (!employee || !employee.isActive) {
      await QRScan.create({
        employeeId: validated.employeeId,
        employeeName: 'Unknown',
        qrToken: validated.qrToken,
        scanType: validated.action,
        scanResult: 'failed',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json({ error: 'Employee not found or inactive' }, { status: 404 });
    }

    // Optional email verification
    if (validated.email && validated.email.toLowerCase() !== employee.email.toLowerCase()) {
      return NextResponse.json({ error: 'Email verification failed' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (validated.action === 'check_in') {
      // Check if already checked in
      const existing = await Attendance.findOne({
        userId: employee._id,
        date: { $gte: today, $lt: tomorrow },
      });

      if (existing && existing.checkInTime) {
        await QRScan.create({
          employeeId: employee._id.toString(),
          employeeName: `${employee.firstName} ${employee.lastName}`,
          qrToken: validated.qrToken,
          scanType: 'check_in',
          scanResult: 'already_checked',
        });
        return NextResponse.json(
          { error: 'Already checked in today', checkInTime: existing.checkInTime },
          { status: 409 }
        );
      }

      // Create attendance record
      const now = new Date();
      const attendance = await Attendance.create({
        userId: employee._id,
        date: now,
        checkInTime: now,
        checkInMethod: 'qr',
        isPresent: true,
        status: 'present',
      });

      // Record successful scan
      await QRScan.create({
        employeeId: employee._id.toString(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        qrToken: validated.qrToken,
        scanType: 'check_in',
        scanResult: 'success',
      });

      return NextResponse.json({
        message: 'Check-in successful!',
        employeeName: `${employee.firstName} ${employee.lastName}`,
        checkInTime: attendance.checkInTime,
      });
    } else {
      // Check out
      const attendance = await Attendance.findOne({
        userId: employee._id,
        date: { $gte: today, $lt: tomorrow },
      });

      if (!attendance || !attendance.checkInTime) {
        return NextResponse.json({ error: 'No check-in record found for today' }, { status: 404 });
      }

      if (attendance.checkOutTime) {
        await QRScan.create({
          employeeId: employee._id.toString(),
          employeeName: `${employee.firstName} ${employee.lastName}`,
          qrToken: validated.qrToken,
          scanType: 'check_out',
          scanResult: 'already_checked',
        });
        return NextResponse.json({ error: 'Already checked out today' }, { status: 409 });
      }

      const checkOutTime = new Date();
      const hoursWorked = (checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60);

      attendance.checkOutTime = checkOutTime;
      attendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
      await attendance.save();

      // Record successful scan
      await QRScan.create({
        employeeId: employee._id.toString(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        qrToken: validated.qrToken,
        scanType: 'check_out',
        scanResult: 'success',
      });

      return NextResponse.json({
        message: 'Check-out successful!',
        employeeName: `${employee.firstName} ${employee.lastName}`,
        checkOutTime,
        hoursWorked: attendance.hoursWorked,
      });
    }
  } catch (error) {
    console.error('[v0] Kiosk scan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    );
  }
}

// GET: Get employees list for kiosk display (public - no auth, validated by QR token)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const qrToken = request.nextUrl.searchParams.get('t');
    if (!qrToken) {
      return NextResponse.json({ error: 'QR token required' }, { status: 400 });
    }

    // Verify QR token
    const qr = await OfficeQR.findOne({ qrToken, isActive: true });
    if (!qr) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 });
    }

    // Get active employees
    const employees = await User.find({ role: 'employee', isActive: true })
      .select('firstName lastName email department _id')
      .sort({ firstName: 1 })
      .lean();

    return NextResponse.json({
      employees: employees.map((e) => ({
        id: e._id,
        name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        department: e.department,
      })),
      label: qr.label,
    });
  } catch (error) {
    console.error('[v0] Kiosk employees error:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}
