import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { Settings } from '@/models/Settings';
import { AuditLog } from '@/models/AuditLog';

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

    // Get or create default settings (singleton)
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        companyName: 'My Company',
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[v0] Get settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Whitelist allowed fields to prevent unwanted overwrites
    const allowedFields: Record<string, any> = {};

    if (body.companyName !== undefined) allowedFields.companyName = body.companyName;
    if (body.timezone !== undefined) allowedFields.timezone = body.timezone;
    if (body.geofenceRadius !== undefined) allowedFields.geofenceRadius = Number(body.geofenceRadius);
    if (body.workingHoursStart !== undefined) allowedFields.workingHoursStart = body.workingHoursStart;
    if (body.workingHoursEnd !== undefined) allowedFields.workingHoursEnd = body.workingHoursEnd;
    if (body.lateMarginMinutes !== undefined) allowedFields.lateMarginMinutes = Number(body.lateMarginMinutes);
    if (body.breakDurationMinutes !== undefined) allowedFields.breakDurationMinutes = Number(body.breakDurationMinutes);
    if (body.expectedWorkingHoursPerDay !== undefined) allowedFields.expectedWorkingHoursPerDay = Number(body.expectedWorkingHoursPerDay);
    if (body.allowRemoteWork !== undefined) allowedFields.allowRemoteWork = Boolean(body.allowRemoteWork);
    if (body.requireGPSVerification !== undefined) allowedFields.requireGPSVerification = Boolean(body.requireGPSVerification);
    if (body.requirePhotoVerification !== undefined) allowedFields.requirePhotoVerification = Boolean(body.requirePhotoVerification);

    // Handle nested officeLocation
    if (body.officeLocation) {
      const lat = parseFloat(body.officeLocation.latitude);
      const lng = parseFloat(body.officeLocation.longitude);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return NextResponse.json(
          { error: 'Invalid coordinates. Latitude must be -90 to 90, longitude must be -180 to 180.' },
          { status: 400 }
        );
      }

      allowedFields['officeLocation.latitude'] = lat;
      allowedFields['officeLocation.longitude'] = lng;
    }

    // Validate working hours format (HH:mm)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (allowedFields.workingHoursStart && !timeRegex.test(allowedFields.workingHoursStart)) {
      return NextResponse.json({ error: 'Invalid start time format. Use HH:mm.' }, { status: 400 });
    }
    if (allowedFields.workingHoursEnd && !timeRegex.test(allowedFields.workingHoursEnd)) {
      return NextResponse.json({ error: 'Invalid end time format. Use HH:mm.' }, { status: 400 });
    }

    // Update or create settings
    let settings = await Settings.findOne();
    if (!settings) {
      // For create, flatten the dotted officeLocation back
      const createData: any = { ...allowedFields };
      if (allowedFields['officeLocation.latitude'] !== undefined) {
        createData.officeLocation = {
          latitude: allowedFields['officeLocation.latitude'],
          longitude: allowedFields['officeLocation.longitude'],
        };
        delete createData['officeLocation.latitude'];
        delete createData['officeLocation.longitude'];
      }
      settings = await Settings.create(createData);
    } else {
      // Use $set with dot notation for nested fields
      await Settings.updateOne({ _id: settings._id }, { $set: allowedFields });
      settings = await Settings.findById(settings._id);
    }

    // Audit log
    await AuditLog.create({
      userId: decoded.userId,
      action: 'Settings updated',
      actionType: 'update',
      resourceType: 'Settings',
      resourceId: settings?._id?.toString(),
      status: 'success',
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('[v0] Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
