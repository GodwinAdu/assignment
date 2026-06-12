import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Leave } from '@/models/Leave';
import { AuditLog } from '@/models/AuditLog';
import { z } from 'zod';

const LeaveRequestSchema = z.object({
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  reason: z.string().min(10).max(500),
  leaveType: z.enum(['sick', 'casual', 'personal', 'emergency', 'other']),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validated = LeaveRequestSchema.parse(body);

    const { leaveType, startDate, endDate, reason } = validated;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check if dates overlap
    const existing = await Leave.findOne({
      userId: decoded.userId,
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
      ],
      status: { $in: ['approved', 'pending'] },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Date range overlaps with existing leave' },
        { status: 400 }
      );
    }

    // Create leave request
    const leave = await Leave.create({
      userId: decoded.userId,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      leaveType,
      status: 'pending',
    });

    // Log action
    await AuditLog.create({
      userId: decoded.userId,
      action: 'LEAVE_REQUEST_CREATED',
      actionType: 'create',
      resourceType: 'Leave',
      resourceId: leave._id.toString(),
      changes: [{ field: 'status', oldValue: null, newValue: 'pending' }],
      status: 'success',
    });

    return NextResponse.json(
      { message: 'Leave request submitted', leave },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Leave request error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

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

    const leaves = await Leave.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ leaves }, { status: 200 });
  } catch (error) {
    console.error('[v0] Get leaves error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
