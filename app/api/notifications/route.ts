import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/jwt';
import Notification from '@/models/Notification';

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

    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '20'),
      100
    );

    const query: any = { userId: decoded.userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      userId: decoded.userId,
      isRead: false,
    });

    return NextResponse.json(
      { notifications, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
