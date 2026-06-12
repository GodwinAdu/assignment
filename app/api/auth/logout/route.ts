import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { AuditLog } from '@/models/AuditLog';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('accessToken')?.value;

    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        // Log audit
        await AuditLog.create({
          userId: payload.userId,
          action: 'User logout',
          actionType: 'logout',
          resourceType: 'User',
          status: 'success',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        });
      }
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    console.log('[v0] User logged out');
    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
