import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Leave } from '@/models/Leave';
import { User } from '@/models/User';
import { Attendance } from '@/models/Attendance';
import Notification from '@/models/Notification';
import { AuditLog } from '@/models/AuditLog';
import { z } from 'zod';

// GET: Fetch all leave requests for admin
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

    const status = request.nextUrl.searchParams.get('status') || 'all';

    const query: any = {};
    if (status !== 'all') {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Get employee details
    const userIds = [...new Set(leaves.map((l) => l.userId))];
    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName email department')
      .lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const leaveData = leaves.map((leave) => {
      const user = userMap.get(leave.userId.toString());
      return {
        id: leave._id,
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        employeeEmail: user?.email || '',
        department: user?.department || 'N/A',
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        numberOfDays: leave.numberOfDays,
        reason: leave.reason,
        status: leave.status,
        rejectionReason: leave.rejectionReason,
        createdAt: leave.createdAt,
      };
    });

    // Counts
    const allLeaves = await Leave.find().lean();
    const counts = {
      all: allLeaves.length,
      pending: allLeaves.filter((l) => l.status === 'pending').length,
      approved: allLeaves.filter((l) => l.status === 'approved').length,
      rejected: allLeaves.filter((l) => l.status === 'rejected').length,
    };

    return NextResponse.json({ leaves: leaveData, counts });
  } catch (error) {
    console.error('[v0] Admin leave fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}

// POST: Approve or reject leave
const ApproveRejectSchema = z.object({
  leaveId: z.string(),
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validated = ApproveRejectSchema.parse(body);

    const newStatus = validated.action === 'approve' ? 'approved' : 'rejected';

    const leave = await Leave.findByIdAndUpdate(
      validated.leaveId,
      {
        status: newStatus,
        approvedBy: decoded.userId,
        approvalDate: new Date(),
        rejectionReason: validated.action === 'reject' ? validated.adminNotes : undefined,
      },
      { new: true }
    );

    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // If approved, mark attendance as 'leave' for those dates (weekdays only)
    if (newStatus === 'approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const current = new Date(start);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const dateStart = new Date(current);
          dateStart.setHours(0, 0, 0, 0);

          // Create or update attendance record as 'leave'
          await Attendance.findOneAndUpdate(
            {
              userId: leave.userId,
              date: { $gte: dateStart, $lt: new Date(dateStart.getTime() + 24 * 60 * 60 * 1000) },
            },
            {
              userId: leave.userId,
              date: dateStart,
              status: 'leave',
              isPresent: false,
              remarks: `On ${leave.leaveType} leave`,
            },
            { upsert: true, new: true }
          );
        }
        current.setDate(current.getDate() + 1);
      }
    }

    // Send notification to employee
    const user = await User.findById(leave.userId);
    if (user) {
      await Notification.create({
        userId: leave.userId,
        type: newStatus === 'approved' ? 'leave_approved' : 'leave_rejected',
        title: `Leave ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your ${leave.leaveType} leave request (${leave.numberOfDays} days) has been ${newStatus}.${validated.adminNotes ? ` Note: ${validated.adminNotes}` : ''}`,
        relatedId: leave._id,
      });
    }

    // Audit log
    await AuditLog.create({
      userId: decoded.userId,
      action: `Leave ${newStatus}: ${user?.firstName} ${user?.lastName}`,
      actionType: 'update',
      resourceType: 'Leave',
      resourceId: leave._id.toString(),
      changes: [{ field: 'status', oldValue: 'pending', newValue: newStatus }],
      status: 'success',
    });

    return NextResponse.json({
      message: `Leave request ${newStatus} successfully`,
      leave,
    });
  } catch (error) {
    console.error('[v0] Leave approve/reject error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
