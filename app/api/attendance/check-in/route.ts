import { NextRequest, NextResponse } from 'next/server';
import { Attendance } from '@/models/Attendance';
import { Settings } from '@/models/Settings';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { AuditLog } from '@/models/AuditLog';
import { calculateDistance } from '@/lib/geofence';
import { z } from 'zod';

const checkInSchema = z.object({
  checkInMethod: z.enum(['qr', 'gps', 'manual', 'biometric']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user access
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = checkInSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { checkInMethod, latitude, longitude } = validation.data;

    // Get settings for geofence and late detection
    const settings = await Settings.findOne();

    // ===== GEOFENCE VALIDATION =====
    // If GPS check-in and GPS verification is required, validate location
    if (checkInMethod === 'gps' && settings?.requireGPSVerification) {
      if (!latitude || !longitude) {
        return NextResponse.json(
          { error: 'GPS location is required for check-in. Please enable location services.' },
          { status: 400 }
        );
      }

      // Check if employee is within the geofence radius
      const officeLatitude = settings.officeLocation?.latitude;
      const officeLongitude = settings.officeLocation?.longitude;
      const geofenceRadius = settings.geofenceRadius || 500;

      if (officeLatitude && officeLongitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          officeLatitude,
          officeLongitude
        );

        console.log(`[v0] Geofence check: employee at ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | office at ${officeLatitude}, ${officeLongitude} | distance: ${Math.round(distance)}m | radius: ${geofenceRadius}m`);

        // If remote work is NOT allowed, enforce geofence
        if (!settings.allowRemoteWork && distance > geofenceRadius) {
          return NextResponse.json(
            {
              error: `You are too far from the office. Distance: ${Math.round(distance)}m (max: ${geofenceRadius}m). Please move closer to the office or contact your admin.`,
              distance: Math.round(distance),
              maxRadius: geofenceRadius,
            },
            { status: 403 }
          );
        }
      }
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in
    const existingRecord = await Attendance.findOne({
      userId: payload.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingRecord && existingRecord.checkInTime) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 409 }
      );
    }

    // ===== LATE DETECTION =====
    const now = new Date();
    let status: 'present' | 'late' = 'present';

    if (settings) {
      const [startHour, startMin] = settings.workingHoursStart.split(':').map(Number);
      const lateMargin = settings.lateMarginMinutes || 15;
      const lateThreshold = new Date(now);
      lateThreshold.setHours(startHour, startMin + lateMargin, 0, 0);

      if (now > lateThreshold) {
        status = 'late';
      }
    }

    // ===== CREATE ATTENDANCE RECORD =====
    const attendance = new Attendance({
      userId: payload.userId,
      date: now,
      checkInTime: now,
      checkInMethod,
      checkInLocation: latitude && longitude ? { latitude, longitude } : undefined,
      isPresent: true,
      status,
    });

    await attendance.save();

    // Log audit
    await AuditLog.create({
      userId: payload.userId,
      action: `Check-in via ${checkInMethod}${status === 'late' ? ' (late)' : ''}`,
      actionType: 'create',
      resourceType: 'Attendance',
      resourceId: attendance._id,
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    console.log(`[v0] Check-in successful for user: ${payload.userId} | method: ${checkInMethod} | status: ${status}`);
    return NextResponse.json(
      {
        message: status === 'late' ? 'Check-in successful (marked as late)' : 'Check-in successful',
        checkInTime: attendance.checkInTime,
        status,
        isLate: status === 'late',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
