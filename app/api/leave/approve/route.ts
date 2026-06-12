import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Leave } from '@/models/Leave';
import { AuditLog } from '@/models/AuditLog';
import { z } from 'zod';

const ApproveSchema = z.object({
  leaveId: z.string(),
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
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
    const validated = ApproveSchema.parse(body);

    const leave = await Leave.findByIdAndUpdate(
      validated.leaveId,
      {
        status: validated.status,
        approvedBy: decoded.userId,
        approvalDate: new Date(),
        rejectionReason: validated.rejectionReason,
      },
      { new: true }
    );

    if (!leave) {
      return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
    }

    // Log action
    await AuditLog.create({
      userId: decoded.userId,
      action: `LEAVE_${validated.status.toUpperCase()}`,
      actionType: 'update',
      resourceType: 'Leave',
      resourceId: leave._id.toString(),
      changes: [
        { field: 'status', oldValue: 'pending', newValue: validated.status },
      ],
      status: 'success',
    });

    return NextResponse.json(
      { message: `Leave ${validated.status}`, leave },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Leave approval error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
