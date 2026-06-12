import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
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

    // Generate a unique QR code with timestamp
    const qrData = {
      timestamp: Date.now(),
      secret: process.env.JWT_SECRET || 'secret',
    };

    const qrString = JSON.stringify(qrData);
    const qrCode = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#667eea',
        light: '#ffffff',
      },
    });

    return NextResponse.json(
      {
        qrCode,
        data: qrData,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] QR generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
