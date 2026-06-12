import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import { OfficeQR } from '@/models/OfficeQR';
import { QRScan } from '@/models/QRScan';
import crypto from 'crypto';

// GET: Get active office QR code
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

    // Find active QR or create one
    let activeQR = await OfficeQR.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!activeQR) {
      const qrToken = crypto.randomBytes(32).toString('hex');
      activeQR = await OfficeQR.create({
        qrToken,
        label: 'Main Entrance',
        isActive: true,
        createdBy: decoded.userId,
      });
    }

    // Today's scan count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayScans = await QRScan.countDocuments({
      scannedAt: { $gte: todayStart },
      scanResult: 'success',
    });

    // Recent scans
    const recentScans = await QRScan.find()
      .sort({ scannedAt: -1 })
      .limit(10)
      .lean();

    // QR history
    const history = await OfficeQR.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Build check-in URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const checkinUrl = `${baseUrl}/kiosk?t=${activeQR.qrToken}`;

    return NextResponse.json({
      activeQR: {
        id: activeQR._id,
        qrToken: activeQR.qrToken,
        label: activeQR.label,
        createdAt: activeQR.createdAt,
        checkinUrl,
      },
      todayScans,
      recentScans,
      history,
    });
  } catch (error) {
    console.error('[v0] Get office QR error:', error);
    return NextResponse.json({ error: 'Failed to fetch QR data' }, { status: 500 });
  }
}

// POST: Generate new QR code (invalidates old one)
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
    const label = body.label || 'Main Entrance';

    // Deactivate all existing codes
    await OfficeQR.updateMany({}, { isActive: false });

    // Create new one
    const qrToken = crypto.randomBytes(32).toString('hex');
    const newQR = await OfficeQR.create({
      qrToken,
      label,
      isActive: true,
      createdBy: decoded.userId,
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const checkinUrl = `${baseUrl}/kiosk?t=${newQR.qrToken}`;

    return NextResponse.json({
      message: 'New QR code generated. Old codes are now invalid.',
      qr: {
        id: newQR._id,
        qrToken: newQR.qrToken,
        label: newQR.label,
        checkinUrl,
        createdAt: newQR.createdAt,
      },
    });
  } catch (error) {
    console.error('[v0] Generate QR error:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
