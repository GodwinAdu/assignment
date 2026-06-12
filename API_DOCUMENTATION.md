# Smart Attendance System - API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account
- **Body**: `{ email, password, name }`
- **Returns**: `{ user, accessToken }`

### POST /api/auth/login
Login with email and password
- **Body**: `{ email, password }`
- **Returns**: `{ user, accessToken, requiresOTP? }`

### POST /api/auth/logout
Logout and clear tokens
- **Returns**: `{ message: "Logged out" }`

### POST /api/auth/refresh
Refresh access token using refresh token from cookie
- **Returns**: `{ accessToken }`

### POST /api/auth/verify-otp
Verify OTP sent to email
- **Body**: `{ email, otp }`
- **Returns**: `{ accessToken, user }`

### POST /api/auth/forgot-password
Request password reset
- **Body**: `{ email }`
- **Returns**: `{ message: "Reset email sent" }`

### POST /api/auth/reset-password
Reset password with token
- **Body**: `{ token, newPassword }`
- **Returns**: `{ message: "Password reset successful" }`

### POST /api/auth/invite-employee (Admin)
Invite new employee
- **Body**: `{ email, name, department, position }`
- **Returns**: `{ message: "Invitation sent", invitationToken }`

### POST /api/auth/accept-invitation
Accept invitation and create account
- **Body**: `{ token, password }`
- **Returns**: `{ user, accessToken }`

## Employee Profile Endpoints

### GET /api/employee/profile
Get current user profile and stats
- **Returns**: `{ user, attendance, leaves, performance }`

## Attendance Endpoints

### POST /api/attendance/check-in
Record check-in with optional QR code and GPS location
- **Body**: `{ latitude?, longitude?, qrCode?, method }`
- **Returns**: `{ message: "Checked in", attendance }`

### POST /api/attendance/check-out
Record check-out
- **Body**: `{ latitude?, longitude? }`
- **Returns**: `{ message: "Checked out", attendance }`

### GET /api/admin/employees
Get all employees with filters (Admin)
- **Query**: `?department=&status=&limit=&skip=`
- **Returns**: `{ employees, total }`

## Leave Endpoints

### POST /api/leave/request
Submit leave request
- **Body**: `{ startDate, endDate, reason, type }`
- **Returns**: `{ message: "Leave request submitted", leave }`

### GET /api/leave/request
Get user's leave requests
- **Returns**: `{ leaves }`

### POST /api/leave/approve (Admin)
Approve or reject leave request
- **Body**: `{ leaveId, status, adminNotes? }`
- **Returns**: `{ message: "Leave approved/rejected", leave }`

## Notifications Endpoints

### GET /api/notifications
Get user notifications
- **Query**: `?unread=&limit=`
- **Returns**: `{ notifications, unreadCount }`

### PATCH /api/notifications/[id]
Mark notification as read
- **Returns**: `{ notification }`

## Analytics Endpoints

### GET /api/analytics/overview (Admin)
Get dashboard analytics
- **Returns**: 
```
{
  totalEmployees: number,
  todayAttendance: number,
  todayAbsent: number,
  pendingLeaves: number,
  attendanceRate: number,
  topPerformers: array,
  departments: array,
  attendanceTrend: array
}
```

## QR Code Endpoints

### GET /api/qr/generate (Admin)
Generate new QR code for check-in
- **Returns**: `{ qrCode: dataURL, expiresAt }`

## Report Endpoints

### POST /api/reports/generate (Admin)
Generate attendance report
- **Body**: `{ type: 'pdf'|'excel', month?, department? }`
- **Returns**: Binary file download

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message here"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Authentication

- Include `accessToken` in HTTP-only cookies (automatically managed)
- Token expires in 15 minutes
- Use refresh endpoint to get new token
- Refresh token stored in HTTP-only cookie, expires in 7 days

## Rate Limiting

- 100 requests per 15 minutes per IP
- OTP verification: 5 attempts per email per hour
- Password reset: 3 attempts per email per hour

## Data Models

### User
- `_id`, `email`, `name`, `password` (hashed)
- `role` (admin/employee)
- `department`, `position`
- `leaveBalance`, `isActive`
- `createdAt`

### Attendance
- `_id`, `userId`, `date`
- `checkInTime`, `checkOutTime`
- `location` (lat, long)
- `method` (qr/gps/manual)
- `status` (present/absent/late)
- `hoursWorked`

### Leave
- `_id`, `userId`
- `startDate`, `endDate`
- `type` (sick/personal/vacation/emergency)
- `status` (pending/approved/rejected)
- `reason`, `adminNotes`
- `approvedBy`, `approvedAt`

### Performance
- `_id`, `userId`
- `attendanceScore`, `hoursScore`, `punctualityScore`
- `overallScore`
- `rank`
- `lastUpdated`

### Notification
- `_id`, `userId`
- `type` (leave_approved/leave_rejected/attendance_marked/etc)
- `title`, `message`
- `isRead`, `readAt`
- `createdAt`, `expiresAt`

### AuditLog
- `_id`, `userId`
- `action` (USER_CREATED/LOGIN/CHECK_IN/LEAVE_REQUEST/etc)
- `resource`, `resourceId`
- `changes` (JSON of what changed)
- `timestamp`

### Settings
- Company information
- Geofence location and radius
- Working hours (start/end time)
- Feature toggles
- Email templates
