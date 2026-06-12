import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from '@/lib/jwt';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/accept-invitation',
    '/auth/verify-otp',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/accept-invitation',
    '/api/auth/verify-otp',
    '/api/auth/refresh',
    '/api/kiosk/scan',
    '/kiosk',
  ];

  // Check if route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Also allow static assets and API auth routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Protected admin routes
  const adminRoutes = ['/admin', '/api/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Protected employee routes
  const employeeRoutes = ['/employee', '/api/employee'];
  const isEmployeeRoute = employeeRoutes.some(route => pathname.startsWith(route));

  // Protected API routes (attendance, leave, notifications, analytics, reports, qr)
  const protectedApiRoutes = ['/api/attendance', '/api/leave', '/api/notifications', '/api/analytics', '/api/reports', '/api/qr'];
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route, verify token
  if (isAdminRoute || isEmployeeRoute || isProtectedApi) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Try to verify access token first
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        // Access token is valid — proceed with role check
        return handleRoleCheck(request, payload, isAdminRoute, isEmployeeRoute);
      }
    }

    // Access token is missing or expired — try refresh token
    if (refreshToken) {
      const refreshPayload = verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        // Refresh token is valid — generate a new access token
        const newAccessToken = generateAccessToken({
          userId: refreshPayload.userId,
          email: refreshPayload.email,
          role: refreshPayload.role,
        });

        // For API routes, set the new token and proceed
        // For page routes, set the cookie and proceed
        const response = handleRoleCheck(request, refreshPayload, isAdminRoute, isEmployeeRoute);

        // Set the new access token cookie on the response
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 minutes
          path: '/',
        });

        return response;
      }
    }

    // Both tokens are invalid/missing — redirect to login
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

function handleRoleCheck(
  request: NextRequest,
  payload: { userId: string; email: string; role: 'admin' | 'employee' },
  isAdminRoute: boolean,
  isEmployeeRoute: boolean
): NextResponse {
  // Check role-based access for admin routes
  if (isAdminRoute && payload.role !== 'admin') {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/employee/dashboard', request.url));
  }

  // Check role-based access for employee routes (both admin and employee can access)
  if (isEmployeeRoute && !['admin', 'employee'].includes(payload.role)) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icons, manifest
     */
    '/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest).*)',
  ],
};
