# Smart Employee Attendance & Workforce Management System
## Final Project Presentation

---

## SLIDE 1: Title

**Smart Employee Attendance & Workforce Management System**

A comprehensive web-based solution for tracking employee attendance, managing leave requests, monitoring performance, and generating real-time reports with GPS geofencing and QR-based check-in.

**Presented by:** [Your Name]
**Supervisor:** [Supervisor Name]
**Date:** June 2026

---

## SLIDE 2: Problem Statement

### The Challenge
Traditional attendance tracking methods (paper sign-in sheets, manual registers) suffer from:

- **Buddy punching** — employees signing in for absent colleagues
- **Time theft** — inaccurate clock-in/out records
- **No real-time visibility** — admins can't see who's present right now
- **Manual report generation** — hours wasted compiling attendance data
- **No location verification** — no proof employee was actually at the office
- **Paper-based leave requests** — slow approval process, lost forms

### Our Solution
A modern, web-based system that automates attendance tracking with GPS verification, QR code scanning, real-time dashboards, and automated reporting.

---

## SLIDE 3: Project Objectives

### Main Objective
To design and develop a web-based employee attendance and workforce management system that eliminates manual tracking inefficiencies through GPS geofencing, QR code scanning, and automated performance analytics.

### Specific Objectives

1. **To develop a secure authentication system** with JWT tokens, email verification, and role-based access control for admin and employee users.

2. **To implement GPS-based geofencing** that verifies employee location against a configurable office radius before allowing attendance check-in.

3. **To build a QR code-based kiosk system** enabling quick, contactless check-in at office entrances without requiring app installation.

4. **To create an automated leave management workflow** where employees request leave, admins approve/reject, and the system auto-updates attendance records.

5. **To develop an automated performance scoring system** that calculates employee ratings based on attendance rate, hours worked, and punctuality.

6. **To build a comprehensive reporting module** with visual charts, department breakdowns, and exportable reports (PDF and Excel).

7. **To ensure the system is accessible** as a Progressive Web App (PWA) that works on mobile, tablet, and desktop devices.

### Scope
| In Scope | Out of Scope |
|----------|-------------|
| Attendance tracking (GPS, QR, Manual) | Payroll integration |
| Leave management with approval workflow | Shift scheduling |
| Performance analytics with scoring formula | Facial recognition |
| Real-time notifications | Mobile native app |
| Report generation (PDF/Excel) | Multi-company/tenant support |
| Admin configuration panel | Hardware biometric readers |

---

## SLIDE 4: Literature Review & Existing Systems

### Existing Solutions Comparison

| Feature | Paper Register | Biometric (Fingerprint) | BambooHR (SaaS) | Our System |
|---------|---------------|------------------------|-----------------|------------|
| Cost | Low | High hardware cost | $6/user/month | Free (self-hosted) |
| Buddy punching prevention | ✗ | ✓ | Partial | ✓ (GPS + QR) |
| Remote work support | ✗ | ✗ | ✓ | ✓ |
| Location verification | ✗ | ✗ | ✗ | ✓ (Geofencing) |
| Leave management | Manual | Separate system | ✓ | ✓ |
| Performance scoring | ✗ | ✗ | Separate module | ✓ (Built-in) |
| Real-time dashboard | ✗ | Basic | ✓ | ✓ |
| Mobile access | ✗ | ✗ | ✓ | ✓ (PWA) |
| No app install needed | N/A | N/A | Needs login | ✓ (QR kiosk) |
| Open source/customizable | N/A | ✗ | ✗ | ✓ |

### Why Our Approach Is Better

1. **No hardware required** — Uses employee's own smartphone GPS and camera (zero hardware cost)
2. **Geofencing solves the "work from home" problem** — Admin can toggle remote work on/off
3. **QR kiosk requires no app** — Employee just scans with native phone camera
4. **Performance is auto-calculated** — No subjective manual scoring needed
5. **Full-stack in one codebase** — Frontend, backend, and database in a single Next.js project (easy to maintain)

### Technologies Reviewed
- **Next.js** chosen over plain React for server-side rendering and API routes (no separate backend needed)
- **MongoDB** chosen over MySQL for flexible schema and JSON-native data (better for attendance records with varying fields)
- **JWT** chosen over sessions for stateless authentication (better for serverless deployment)
- **Haversine formula** chosen for geofence calculation (standard for GPS distance on a sphere)

---

## SLIDE 5: System Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR1 | System shall allow employees to check in/out using GPS, QR, or manual methods | High |
| FR2 | System shall verify employee location against configured geofence | High |
| FR3 | System shall automatically detect and mark late arrivals | High |
| FR4 | System shall allow employees to submit leave requests | High |
| FR5 | System shall allow admins to approve/reject leave with notes | High |
| FR6 | System shall auto-mark attendance as "on leave" for approved dates | Medium |
| FR7 | System shall calculate performance scores using weighted formula | Medium |
| FR8 | System shall generate PDF and Excel reports | Medium |
| FR9 | System shall send email notifications (OTP, invitation, password reset) | High |
| FR10 | System shall provide real-time dashboard with attendance statistics | Medium |
| FR11 | System shall allow admin to configure office location and work hours | High |
| FR12 | System shall provide QR-based kiosk for contactless check-in | Medium |
| FR13 | System shall maintain audit trail of all actions | Low |
| FR14 | System shall support role-based access (Admin/Employee) | High |

### Non-Functional Requirements

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR1 | Response time | API responses < 2 seconds |
| NFR2 | Availability | 99.9% uptime (Vercel + MongoDB Atlas) |
| NFR3 | Security | Passwords hashed, tokens encrypted, HTTPS |
| NFR4 | Scalability | Supports 500+ employees without degradation |
| NFR5 | Usability | Mobile-responsive, works on all modern browsers |
| NFR6 | Maintainability | TypeScript types, modular code structure |
| NFR7 | Data integrity | Unique constraints, validation on all inputs |

### Hardware & Software Requirements

**Development Environment:**
| Requirement | Specification |
|-------------|--------------|
| OS | Windows 10/11, macOS, or Linux |
| RAM | 8GB minimum |
| Node.js | v18 or higher |
| Browser | Chrome, Firefox, Edge, Safari (latest) |
| IDE | VS Code with TypeScript support |

**Production Environment:**
| Requirement | Specification |
|-------------|--------------|
| Hosting | Vercel (serverless) |
| Database | MongoDB Atlas (M0 free tier or above) |
| Email | Gmail with App Password |
| SSL | Automatic via Vercel |
| Domain | Custom domain (optional) |

**End User Requirements:**
| Requirement | Specification |
|-------------|--------------|
| Device | Smartphone, tablet, or computer |
| Browser | Any modern browser with JavaScript enabled |
| Internet | Required for all operations |
| GPS | Required for geofence check-in (smartphone) |
| Camera | Required for QR scanning (smartphone) |

---

## SLIDE 6: Use Case Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │          SMART ATTENDANCE SYSTEM                  │
                    │                                                   │
    ┌───────┐      │  ┌─────────────────┐    ┌──────────────────┐    │
    │       │      │  │  Register/Login  │    │  Manage Settings  │    │
    │       │──────┼─►│                 │    │  (GPS, Hours)     │◄───┼──┐
    │       │      │  └─────────────────┘    └──────────────────┘    │  │
    │       │      │                                                   │  │
    │       │      │  ┌─────────────────┐    ┌──────────────────┐    │  │
    │       │──────┼─►│  Check In/Out   │    │  Manage Employees │◄───┼──┤
    │ EMPL- │      │  │  (GPS/QR/Manual)│    │  (Invite/Edit)    │    │  │
    │ OYEE  │      │  └─────────────────┘    └──────────────────┘    │  │
    │       │      │                                                   │  │  ┌───────┐
    │       │      │  ┌─────────────────┐    ┌──────────────────┐    │  │  │       │
    │       │──────┼─►│  Request Leave  │    │  Approve/Reject   │◄───┼──┤  │       │
    │       │      │  │                 │    │  Leave Requests   │    │  │  │       │
    │       │      │  └─────────────────┘    └──────────────────┘    │  ├──│ ADMIN │
    │       │      │                                                   │  │  │       │
    │       │      │  ┌─────────────────┐    ┌──────────────────┐    │  │  │       │
    │       │──────┼─►│ View Attendance │    │  View Reports     │◄───┼──┤  │       │
    │       │      │  │ & Performance   │    │  (Charts/Export)  │    │  │  │       │
    │       │      │  └─────────────────┘    └──────────────────┘    │  │  │       │
    │       │      │                                                   │  │  │       │
    │       │      │  ┌─────────────────┐    ┌──────────────────┐    │  │  │       │
    │       │──────┼─►│  View Notifs    │    │  Manage QR Code   │◄───┼──┘  │       │
    └───────┘      │  │                 │    │  (Generate/Print) │    │     └───────┘
                    │  └─────────────────┘    └──────────────────┘    │
                    │                                                   │
                    └─────────────────────────────────────────────────┘
```

### Use Case Descriptions

| Use Case | Actor | Description |
|----------|-------|-------------|
| Register/Login | Employee, Admin | Authenticate with email + password, OTP verification |
| Check In/Out | Employee | Record attendance via GPS location, QR scan, or manual button |
| Request Leave | Employee | Submit leave with type, dates, reason |
| View Attendance | Employee | See personal attendance history and monthly stats |
| View Performance | Employee | See performance score, radar chart, ranking |
| View Notifications | Employee | Read alerts about leave decisions, scores |
| Manage Settings | Admin | Configure office GPS, geofence, work hours, features |
| Manage Employees | Admin | Invite, view, activate/deactivate employees |
| Approve/Reject Leave | Admin | Review requests, add notes, approve or reject |
| View Reports | Admin | Visual charts, department breakdown, export PDF/Excel |
| Manage QR Code | Admin | Generate, regenerate, print office QR poster |

---

## SLIDE 7: System Flowchart

### Main Application Flow

```
                              ┌───────────┐
                              │   START   │
                              └─────┬─────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   Open App (/)   │
                          └────────┬────────┘
                                   │
                                   ▼
                        ┌────────────────────┐
                        │  Has valid token?   │
                        └───┬────────────┬───┘
                            │            │
                         YES │            │ NO
                            ▼            ▼
                   ┌──────────────┐  ┌──────────────┐
                   │ Check Role   │  │  Login Page   │
                   └──┬───────┬──┘  └──────┬───────┘
                      │       │            │
               Admin  │       │ Employee   │ Submit credentials
                      ▼       ▼            ▼
            ┌──────────┐ ┌──────────┐ ┌──────────────┐
            │  Admin   │ │ Employee │ │ Validate +    │
            │Dashboard │ │Dashboard │ │ Issue Tokens  │
            └────┬─────┘ └────┬─────┘ └──────┬───────┘
                 │            │               │
                 ▼            ▼               ▼
        ┌────────────────────────────────────────────┐
        │              USE SYSTEM FEATURES             │
        │                                              │
        │  • Check In/Out (with GPS validation)       │
        │  • Submit/Manage Leave                       │
        │  • View Reports & Performance               │
        │  • Manage Settings & Employees (Admin)      │
        │  • Receive Notifications                     │
        └──────────────────────┬─────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Logout      │
                        │ (Clear tokens)│
                        └──────┬───────┘
                               │
                               ▼
                          ┌─────────┐
                          │   END   │
                          └─────────┘
```

### Check-In Flow (Detailed)

```
Employee clicks "Check In"
         │
         ▼
┌──────────────────┐
│ Select Method     │
│ (GPS/QR/Manual)   │
└──┬──────┬─────┬──┘
   │      │     │
GPS│   QR │     │ Manual
   ▼      ▼     ▼
┌──────┐ ┌────┐ ┌──────┐
│Get   │ │Scan│ │Direct│
│coords│ │code│ │ POST │
└──┬───┘ └─┬──┘ └──┬───┘
   │        │       │
   ▼        ▼       ▼
┌────────────────────────┐
│    API: /check-in       │
├────────────────────────┤
│ 1. Verify JWT token     │
│ 2. Check not already in │
│ 3. Load Settings        │
│ 4. GPS → Geofence check │
│ 5. Check if late        │
│ 6. Save attendance      │
│ 7. Audit log            │
└──────────┬─────────────┘
           │
     ┌─────┴─────┐
     │            │
  SUCCESS      FAILURE
     │            │
     ▼            ▼
"Check-in     "Too far from
 successful"   office (2.3km)"
```

---

## SLIDE 8: System Overview & Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19, TypeScript | Modern reactive UI |
| Styling | Tailwind CSS 4, shadcn/ui | Professional dark theme |
| Backend | Next.js API Routes, Node.js | RESTful API |
| Database | MongoDB Atlas (Mongoose ODM) | Cloud-hosted NoSQL |
| Authentication | JWT (Access + Refresh tokens) | Secure session management |
| Email | Nodemailer (Gmail SMTP) | OTP, invitations, password reset |
| Charts | Recharts | Interactive data visualizations |
| Reports | jsPDF + xlsx | PDF and Excel export |
| Hosting | Vercel | Cloud deployment |

### Architecture Pattern
- **Client-Server Architecture** with API-first design
- **Role-Based Access Control** (Admin vs Employee)
- **Progressive Web App (PWA)** — installable on mobile devices
- **Responsive Design** — works on desktop, tablet, and mobile

---

## SLIDE 9: User Roles & Access

### Admin
- Full system control
- Manage employees (invite, activate/deactivate)
- Approve/reject leave requests
- View all attendance records
- Configure company settings (geofence, work hours)
- Generate and manage QR codes
- Export reports (PDF/Excel)
- Monitor performance rankings

### Employee
- Check in/out (GPS, QR, or Manual)
- View personal attendance history
- Submit leave requests
- View performance scores
- Receive notifications
- Update profile

---

## SLIDE 10: Authentication & Security

### Multi-Layer Security

1. **JWT Token System**
   - Access Token: 15-minute lifespan (short-lived for security)
   - Refresh Token: 7-day lifespan (silent re-authentication)
   - HttpOnly cookies (prevents XSS token theft)
   - Automatic token refresh — users stay logged in seamlessly

2. **Password Security**
   - bcrypt hashing with salt rounds
   - Minimum 8-character requirement
   - Secure password reset via email token (1-hour expiry)

3. **Email OTP Verification**
   - 6-digit code sent on registration
   - 10-minute expiry, 5 max attempts
   - Required before account activation

4. **Employee Invitation Flow**
   - Admin invites via email → Employee receives secure link → Sets password → Verifies OTP → Account active

5. **Additional Measures**
   - Rate limiting (5 attempts per 60 seconds)
   - Input validation (Zod schema validation)
   - XSS prevention (input sanitization)
   - Audit logging of all actions
   - Role-based middleware protection

---

## SLIDE 11: Attendance Check-In System

### Three Check-In Methods

#### 1. GPS Geofencing
- Employee's device captures GPS coordinates
- System calculates distance from office using **Haversine formula**
- Validates against admin-configured geofence radius
- Rejects if employee is outside allowed area
- Shows exact distance in error message

**Haversine Formula:**
```
distance = 2R × arcsin(√(sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)))
```
Where R = 6,371,000 meters (Earth's radius)

#### 2. QR Code (Office Kiosk)
- Admin generates a shared QR code and prints it
- QR encodes a secure URL to the Kiosk page
- Employee scans with phone camera → opens check-in page
- Selects their name → taps Check In/Out
- No app installation needed — works with native camera

#### 3. Manual Check-In
- One-tap button for simple check-in
- Can be used when GPS/QR is unavailable
- Subject to admin approval policies

### Automatic Late Detection
- Compares check-in time against configured `workingHoursStart + lateMarginMinutes`
- Automatically marks as "late" if beyond threshold
- Reflected in performance score

---

## SLIDE 12: GPS Geofencing — How It Works

```
┌─────────────────────────────────────────┐
│           ADMIN SETTINGS                 │
│                                          │
│  Office Lat/Long: 5.6037, -0.1870       │
│  Geofence Radius: 500 meters            │
│  Require GPS: ✓ ON                      │
│  Allow Remote: ✗ OFF                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         EMPLOYEE CHECK-IN                │
│                                          │
│  Employee GPS: 5.6042, -0.1865          │
│  Distance from office: 123 meters       │
│  Radius limit: 500 meters               │
│  Result: ✓ WITHIN GEOFENCE             │
│  → Check-in ALLOWED                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         EMPLOYEE AT HOME                 │
│                                          │
│  Employee GPS: 5.7200, -0.2100          │
│  Distance from office: 13,400 meters    │
│  Radius limit: 500 meters               │
│  Result: ✗ OUTSIDE GEOFENCE            │
│  → Check-in REJECTED                    │
│  → Error: "You are 13,400m away"        │
└─────────────────────────────────────────┘
```

### Configurable Rules
| Setting | Effect |
|---------|--------|
| Require GPS = ON | Location must be verified |
| Require GPS = OFF | Coordinates stored but not enforced |
| Allow Remote Work = ON | Geofence skipped entirely |
| Allow Remote Work = OFF | Must be within radius |

---

## SLIDE 13: QR Code Kiosk System

### Flow Diagram
```
Admin Panel                 Office Entrance              Employee Phone
─────────────              ─────────────────            ──────────────
                           
1. Generate QR ──────►     2. QR Poster                
   (secure token)              printed here             
                                    │                   
                                    ▼                   
                           3. Employee scans ◄──────── Phone camera
                              with camera               
                                    │                   
                                    ▼                   
                           4. Kiosk page opens ────►   Mobile browser
                                                        │
                                                        ▼
                                                   5. Select name
                                                        │
                                                        ▼
                                                   6. Tap "Check In"
                                                        │
                                                        ▼
                                                   7. ✓ Attendance
                                                      recorded!
```

### Security Features
- QR token is 64 characters (cryptographically random)
- Admin can regenerate anytime (invalidates old codes)
- Scan audit trail records every attempt
- Optional email verification step

---

## SLIDE 14: Leave Management

### Employee Flow
1. Employee submits leave request (type, dates, reason)
2. System validates:
   - No overlapping dates with existing requests
   - Start date not after end date
   - Calculates working days automatically
3. Notification sent to admin
4. Request appears in admin queue

### Admin Flow
1. View all pending requests with filter tabs (Pending/Approved/Rejected/All)
2. Review employee details, dates, reason
3. Approve or Reject with admin notes
4. On approval:
   - System auto-marks attendance as "on leave" for those dates
   - Only weekdays are marked (Mon-Fri)
   - Employee receives notification

### Leave Types
- Annual Leave
- Sick Leave
- Casual Leave
- Personal Leave
- Emergency Leave

---

## SLIDE 15: Performance Analytics

### Scoring Formula

```
Overall Score = (Attendance Rate × 0.4) + (Hours Worked Score × 0.4) + (Punctuality Score × 0.2)
```

| Metric | Calculation | Weight |
|--------|-------------|--------|
| Attendance Rate | Days Present ÷ Total Working Days × 100 | 40% |
| Hours Worked Score | Actual Hours ÷ Expected Hours × 100 | 40% |
| Punctuality Score | Days On Time ÷ Days Present × 100 | 20% |

### Ratings
| Score Range | Rating |
|-------------|--------|
| 90-100% | Excellent |
| 75-89% | Good |
| 60-74% | Average |
| Below 60% | Needs Improvement |

### Features
- Company-wide rankings with medals (🥇🥈🥉)
- Radar chart visualization per employee
- Admin can view all employees ranked by score
- Employee can see their own breakdown and position

---

## SLIDE 16: Reports & Analytics

### Admin Dashboard
- Total employees, present today, attendance rate, pending leaves
- 7-day attendance trend (line chart)
- Department breakdown (bar chart)
- Top performers display
- Quick action buttons

### Monthly Reports Page
- Visual report with interactive charts:
  - **Pie chart** — attendance breakdown (present/late/absent/leave)
  - **Bar chart** — department-wise attendance rate
  - **Department table** — with progress bars
  - **Leave summary** — approved/pending/rejected counts
  - **Performance ranking** — top 10 with scores and medals
- Export options:
  - **PDF** — formatted report with headers, summary, employee table
  - **Excel** — multi-sheet workbook (Summary + Employee data)
  - **Print** — browser print with print-optimized CSS

---

## SLIDE 17: Notification System

### Automatic Notifications
| Event | Notification To |
|-------|-----------------|
| Leave request submitted | All admins |
| Leave approved/rejected | Employee |
| Performance score updated | Employee |
| Check-in/out recorded | Employee (optional) |

### Features
- Real-time polling (every 30 seconds)
- Unread count badge in header
- Click to mark as read
- 30-day auto-expiry
- Dropdown panel with recent notifications

---

## SLIDE 18: Admin Settings & Configuration

### Configurable Parameters

| Category | Settings |
|----------|----------|
| Company | Company name, timezone |
| Location | Office GPS coordinates, geofence radius |
| Work Hours | Start time, end time, late margin, break duration |
| Features | Allow remote work, require GPS, expected hours/day |

### "Use My Current Location" Button
- Admin can click to auto-fill office coordinates from their GPS
- No manual coordinate entry needed

### Impact on System
- Geofence radius → controls GPS check-in validation
- Working hours → controls late detection
- Feature toggles → enable/disable GPS enforcement and remote work

---

## SLIDE 19: Database Design

### Collections (7 Models)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    User      │     │   Attendance      │     │    Leave     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ email        │────►│ userId           │     │ userId       │
│ password     │     │ date             │     │ leaveType    │
│ firstName    │     │ checkInTime      │     │ startDate    │
│ lastName     │     │ checkOutTime     │     │ endDate      │
│ role         │     │ checkInMethod    │     │ numberOfDays │
│ department   │     │ checkInLocation  │     │ reason       │
│ isActive     │     │ hoursWorked      │     │ status       │
│ isVerified   │     │ status           │     │ approvedBy   │
└──────────────┘     └──────────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Performance  │     │  Notification    │     │  AuditLog    │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ userId       │     │ userId           │     │ userId       │
│ attendanceR. │     │ type             │     │ action       │
│ hoursWorkedS.│     │ title            │     │ actionType   │
│ punctuality  │     │ message          │     │ resourceType │
│ overallScore │     │ isRead           │     │ ipAddress    │
│ rank         │     │ createdAt        │     │ userAgent    │
└──────────────┘     └──────────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Settings    │     │   OfficeQR       │     │   QRScan     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ companyName  │     │ qrToken          │     │ employeeId   │
│ officeLocation│    │ label            │     │ employeeName │
│ geofenceRadius│   │ isActive         │     │ scanType     │
│ workingHours │     │ createdBy        │     │ scanResult   │
│ lateMargin   │     └──────────────────┘     │ scannedAt    │
│ features     │                               └──────────────┘
└──────────────┘
```

### Indexing Strategy
- Compound indexes on `userId + date` (unique) for attendance
- Index on `overallScore` for ranking queries
- Index on `createdAt` for time-series queries
- Index on `status` for filtered leave queries

---

## SLIDE 20: API Endpoints Summary

### Authentication (9 endpoints)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | New registration |
| POST | /api/auth/logout | Clear session |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/forgot-password | Request reset email |
| POST | /api/auth/reset-password | Set new password |
| POST | /api/auth/invite-employee | Admin invites employee |
| POST | /api/auth/accept-invitation | Employee accepts invite |

### Attendance (2 endpoints)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/attendance/check-in | Check in with GPS/QR/manual |
| POST | /api/attendance/check-out | Check out with location |

### Admin (7 endpoints)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/admin/employees | List all employees |
| GET/POST | /api/admin/attendance | View attendance records |
| GET/POST | /api/admin/leave | Manage leave requests |
| GET | /api/admin/performance | Performance rankings |
| GET/POST | /api/admin/qr | Manage office QR code |
| GET | /api/admin/reports | Report data with charts |
| GET/PUT | /api/admin/settings | System configuration |

### Employee (3 endpoints)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/employee/profile | Profile + today's stats |
| GET | /api/employee/attendance | Attendance history |
| GET | /api/employee/dashboard | Full dashboard data |

### Other (5 endpoints)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/analytics/overview | Admin dashboard stats |
| POST | /api/leave/request | Submit leave request |
| GET/POST | /api/kiosk/scan | Kiosk check-in (public) |
| GET | /api/notifications | User notifications |
| PATCH | /api/notifications/[id] | Mark as read |
| POST | /api/reports/generate | Export PDF/Excel |

---

## SLIDE 21: Pages & Navigation

### Admin Pages (8)
1. `/admin/dashboard` — Overview with stats, charts, top performers
2. `/admin/employees` — Employee list with invite button
3. `/admin/attendance` — Daily attendance records with filters
4. `/admin/leave` — Approve/reject leave requests
5. `/admin/performance` — Employee performance rankings
6. `/admin/qr` — Office QR code management
7. `/admin/reports` — Visual monthly reports with export
8. `/admin/settings` — System configuration

### Employee Pages (6)
1. `/employee/dashboard` — Personal stats, clock, charts
2. `/employee/attendance` — Check in/out (GPS, QR, Manual)
3. `/employee/attendance-history` — Monthly attendance log
4. `/employee/leave` — Submit and track leave requests
5. `/employee/performance` — Personal performance scores
6. `/employee/profile` — View profile info

### Public Pages (5)
1. `/auth/login` — Sign in
2. `/auth/register` — Create account
3. `/auth/forgot-password` — Request reset email
4. `/auth/reset-password` — Set new password
5. `/kiosk` — QR code check-in (no login required)

---

## SLIDE 22: Development Methodology — How It Was Built

### Step-by-Step Development Process

#### Phase 1: Project Setup & Foundation
1. **Initialized Next.js 16** project with TypeScript and Tailwind CSS 4
2. **Set up MongoDB Atlas** cloud database and Mongoose ODM connection
3. **Created the base layout** — dark theme, fonts, root HTML structure
4. **Designed database schemas** — User, Attendance, Leave, Performance, Notification, AuditLog, Settings
5. **Installed core dependencies** — bcryptjs, jsonwebtoken, nodemailer, zod, recharts, jspdf, xlsx, qrcode, lucide-react

#### Phase 2: Authentication System
6. **Built User model** with email, password hash, role, verification fields
7. **Implemented JWT utility** (`lib/jwt.ts`) — access token (15min) + refresh token (7 days)
8. **Created registration API** with bcrypt password hashing
9. **Added OTP verification** — 6-digit code generation, storage, and validation
10. **Built email service** (`lib/email.ts`) — HTML email templates for OTP, invitation, password reset
11. **Implemented login API** — credential validation, token generation, cookie setting
12. **Added token refresh endpoint** — silent re-authentication without re-login
13. **Built forgot/reset password flow** — secure token via email, one-time use
14. **Created employee invitation system** — admin invites → employee receives link → sets password → verifies OTP

#### Phase 3: Core Attendance Features
15. **Built Attendance model** with check-in/out times, location, method, status
16. **Created check-in API** — validates input, prevents duplicate check-in, stores record
17. **Added geofence validation** (`lib/geofence.ts`) — Haversine formula distance calculation
18. **Integrated Settings into check-in** — reads office location, radius, and late threshold
19. **Built check-out API** — calculates hours worked, validates existing check-in
20. **Added late detection logic** — compares check-in time vs configured working hours + margin

#### Phase 4: Admin Panel
21. **Created admin sidebar component** with navigation links
22. **Built admin dashboard** — fetches analytics overview (total employees, today's attendance, trends)
23. **Built employee management page** — list, invite, view status
24. **Created attendance overview page** — date filter, status filter, export button
25. **Built admin settings page** — company info, office GPS, geofence radius, working hours, feature toggles
26. **Created Settings API** with field whitelisting, validation, and audit logging

#### Phase 5: Leave Management
27. **Created Leave model** — types, dates, status, approval tracking
28. **Built leave request API** — overlap detection, day calculation, notification to admins
29. **Built employee leave page** — form submission, request history
30. **Created admin leave management page** — filter tabs, approve/reject modal with notes
31. **Added auto-mark attendance** — on approval, inserts "on leave" records for weekdays

#### Phase 6: QR Code & Kiosk System
32. **Created OfficeQR model** — secure token, label, active status
33. **Created QRScan model** — audit trail for every scan attempt
34. **Built admin QR management API** — generate, regenerate (invalidates old), scan history
35. **Built admin QR page** — QR display, download PNG, print poster, regenerate, scan log
36. **Created kiosk API** — public endpoint, validates QR token, lists employees, processes check-in
37. **Built kiosk page** — mobile-first public UI, employee search, check-in/out toggle, success animation

#### Phase 7: Performance & Reports
38. **Created Performance model** — attendance rate, hours worked score, punctuality, overall score, rank
39. **Built performance calculation utility** (`lib/performance.ts`) — weighted formula
40. **Created admin performance page** — rankings table, sorting, score breakdown
41. **Built employee performance page** — radar chart, KPI cards, score explanation
42. **Created report data API** — aggregates attendance, leave, department, and performance data
43. **Built visual reports page** — pie chart, bar chart, department table, performance ranking, export buttons
44. **Implemented PDF generator** (`lib/report.ts`) — formatted multi-page PDF with headers and tables
45. **Implemented Excel generator** — multi-sheet workbook with Summary + Employee sheets

#### Phase 8: Employee Dashboard & UX
46. **Built employee dashboard API** — today's status, monthly stats, weekly chart data, recent records
47. **Created employee dashboard page** — live clock, check-in/out buttons, stats cards, weekly bar chart, KPI radar
48. **Built employee attendance page** — three methods (GPS, QR camera, Manual), today's status card
49. **Created notification system** — automatic on leave decisions, bell icon with unread badge, polling

#### Phase 9: Security & Middleware
50. **Built proxy middleware** (`proxy.ts`) — route protection, role-based access, automatic token refresh
51. **Created proxy.ts** — connects proxy to Next.js middleware system
52. **Updated useFetch hook** — automatic 401 retry with token refresh, redirect on failure
53. **Added rate limiting** (`lib/security.ts`) — prevents brute force on login
54. **Added audit logging** — tracks every check-in, leave action, settings change, login/logout

#### Phase 10: Frontend Pages & Polish
55. **Built auth pages** — login, register, forgot password, reset password, accept invitation, verify OTP
56. **Added PWA support** — service worker registration, install prompt handling
57. **Created notification bell component** — dropdown with mark-as-read
58. **Styled with dark theme** — consistent color scheme across all pages
59. **Added loading states** — skeleton screens, spinners, disabled buttons
60. **Added print CSS** — reports page prints cleanly

### Development Tools Used
| Tool | Purpose |
|------|---------|
| VS Code + Kiro | AI-assisted development |
| Git | Version control |
| MongoDB Compass | Database inspection |
| Postman / Browser DevTools | API testing |
| Chrome DevTools | Mobile responsive testing |

### Code Organization Principles
- **Separation of concerns** — models, lib utilities, API routes, and UI components are in separate directories
- **Reusable utilities** — geofence, JWT, bcrypt, email, performance calculations are shared
- **Type safety** — TypeScript interfaces on all models and API responses
- **Validation first** — Zod schemas validate input before any database operation
- **Consistent patterns** — every API route follows the same auth check → validate → execute → audit flow

---

## SLIDE 23: Key Technical Features

### Progressive Web App (PWA)
- Installable on mobile home screen
- Offline-capable with service worker
- Native app-like experience

### Real-Time Features
- Live ticking clock on dashboard
- 30-second notification polling
- Instant check-in status feedback
- Auto token refresh (seamless session)

### Responsive Design
- Mobile-first approach
- Sidebar collapses on small screens
- Touch-friendly buttons and controls
- Works on all modern browsers

### Dark Mode UI
- Professional dark theme with purple accents
- Reduces eye strain
- Modern, clean interface

---

## SLIDE 24: Deployment & Production

### Hosting
- **Frontend + Backend:** Vercel (automatic deployment from Git)
- **Database:** MongoDB Atlas (cloud-hosted, auto-scaling)
- **Email:** Gmail SMTP with App Passwords

### Environment Variables
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32+ character secret>
REFRESH_TOKEN_SECRET=<32+ character secret>
EMAIL_USER=company@gmail.com
EMAIL_PASSWORD=<app-specific password>
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

### Production Checklist
- ✅ HTTPS enforced (Vercel default)
- ✅ HttpOnly secure cookies
- ✅ Environment variables secured
- ✅ Rate limiting on auth endpoints
- ✅ Input validation on all endpoints
- ✅ Audit logging for accountability
- ✅ MongoDB indexes for performance
- ✅ Token refresh for session management

---

## SLIDE 25: Demo Scenarios

### Demo Scenario 1: Employee Check-In
1. Login as employee
2. Go to Check In/Out page
3. Select GPS method → Click Check In
4. Show geofence validation (accept/reject based on location)
5. Show late detection (if after configured time)
6. View updated dashboard with today's record

### Demo Scenario 2: Admin Leave Management
1. Login as admin
2. Show pending leave request
3. Click Approve → add admin notes
4. Show notification sent to employee
5. Show attendance auto-marked as "on leave"

### Demo Scenario 3: QR Kiosk
1. Admin generates QR code
2. Open kiosk URL on phone
3. Select employee name
4. Tap Check In → show success
5. Show scan recorded in admin panel

### Demo Scenario 4: Reports
1. Select a month in reports page
2. Show visual charts (pie chart, bar chart)
3. Show department breakdown table
4. Show top performers ranking
5. Export as PDF and Excel

---

## SLIDE 26: Screenshots (Live Demo)

> **Note:** Insert actual screenshots from the running application during your presentation.

### Recommended Screenshots to Capture:

| # | Page | What to Show |
|---|------|-------------|
| 1 | Login Page | Clean dark UI with email/password form |
| 2 | Admin Dashboard | Stats cards, attendance trend chart, top performers |
| 3 | Employee Dashboard | Live clock, check-in buttons, weekly hours chart, radar |
| 4 | Check In (GPS) | GPS method selected, location captured, success message |
| 5 | Check In (Rejected) | Geofence error showing distance "You are 2.3km away" |
| 6 | Admin Leave Management | Pending requests table, approve/reject modal |
| 7 | Employee Leave Form | Leave type dropdown, date pickers, submit button |
| 8 | Admin QR Code Page | QR image displayed, download/print buttons, scan log |
| 9 | Kiosk Page (Mobile) | Employee list, check-in toggle, dark gradient UI |
| 10 | Reports Page | Pie chart, bar chart, department table, export buttons |
| 11 | Performance Page | Radar chart, KPI progress bars, score breakdown |
| 12 | Admin Settings | Office location fields, GPS button, feature toggles |
| 13 | Notifications | Bell icon with badge, dropdown with unread notifications |
| 14 | Mobile Responsive | Dashboard on phone screen (responsive sidebar hidden) |

### Tips for Demo
- Use Chrome DevTools (F12 → Toggle Device Toolbar) to show mobile view
- Keep MongoDB Atlas tab open to show real data being stored
- Have two browser windows: one admin, one employee (to show real-time interactions)
- Check in as employee → show it appearing in admin dashboard immediately

---

## SLIDE 27: Challenges Faced & Solutions

### Technical Challenges

| # | Challenge | Solution Applied |
|---|-----------|-----------------|
| 1 | **Token expiry breaking user sessions** — Access tokens expire every 15 minutes causing frequent logouts | Implemented automatic refresh token rotation: middleware detects expired access token, uses refresh token to generate a new one seamlessly |
| 2 | **Geofence validation not connected to settings** — GPS coordinates were stored but never checked against office location | Integrated Settings model into check-in API: reads office coordinates and radius, uses Haversine formula to calculate distance, rejects if outside radius |
| 3 | **Mongoose enum validation errors** — Model only accepted `['qr', 'manual', 'biometric']` but frontend sends `'gps'` | Added `'gps'` to both the Zod validation schema and Mongoose enum; lesson learned: keep frontend and backend enums in sync |
| 4 | **Next.js 15 Suspense requirement** — `useSearchParams()` causes build errors without Suspense boundary | Wrapped pages using search params in `<Suspense>` with fallback loading states |
| 5 | **Calendar component type mismatch** — `react-day-picker` v10 removed the `table` className from its types | Applied `@ts-expect-error` directive for the specific property while maintaining functionality |
| 6 | **Leave approval not reflecting in attendance** — Approved leave didn't automatically mark days as "on leave" | Added post-approval logic that loops through approved date range, skips weekends, and upserts attendance records with status "leave" |
| 7 | **QR code rendering on server vs client** — QR library requires canvas (browser-only) | Used external QR generation API for the admin page and dynamic import for API route generation |
| 8 | **No middleware file existed** — `proxy.ts` was written but never imported as Next.js middleware | Created `middleware.ts` at project root that imports and exports from `proxy.ts` |

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| MongoDB over SQL | Flexible schema for attendance records with varying fields (location, method); native JSON handling |
| JWT over Sessions | Stateless auth works better with serverless (Vercel); no session storage needed |
| Single codebase (Next.js) | Frontend + backend in one project; fewer deployment configs, shared types |
| External QR API over canvas | More reliable rendering across all browsers; no server-side canvas dependency |
| Auto-calculated performance | Removes subjective bias; score is purely data-driven from attendance records |

---

## SLIDE 28: Testing

### Testing Approach
Manual testing was performed across all features with the following test scenarios:

### Authentication Testing

| Test Case | Input | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Valid login | Correct email + password | Redirect to dashboard, tokens set | ✓ Pass |
| Invalid password | Wrong password | "Invalid credentials" error | ✓ Pass |
| Inactive account | Deactivated user | "Account deactivated" error | ✓ Pass |
| Token expiry | Wait 15+ minutes | Auto-refresh, no logout | ✓ Pass |
| Refresh token expiry | Wait 7+ days | Redirect to login | ✓ Pass |
| Password reset | Valid email | Reset email sent, link works | ✓ Pass |
| OTP verification | Correct 6-digit code | Account verified, logged in | ✓ Pass |
| OTP max attempts | 6 wrong codes | "Max attempts exceeded" | ✓ Pass |

### Attendance Testing

| Test Case | Input | Expected Result | Status |
|-----------|-------|-----------------|--------|
| GPS check-in (within geofence) | Coordinates inside 500m radius | Check-in successful | ✓ Pass |
| GPS check-in (outside geofence) | Coordinates 2km away | "You are 2000m away" error | ✓ Pass |
| GPS check-in (remote work ON) | Any location, remote enabled | Check-in successful | ✓ Pass |
| Double check-in | Already checked in today | "Already checked in" error | ✓ Pass |
| Check-out without check-in | No check-in record | "No check-in record" error | ✓ Pass |
| Late detection | Check in at 09:30 (threshold 09:15) | Marked as "late" | ✓ Pass |
| QR kiosk check-in | Valid QR token + employee selection | Attendance recorded | ✓ Pass |
| Invalid QR token | Expired/wrong token | "Invalid QR code" error | ✓ Pass |

### Leave Management Testing

| Test Case | Input | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Submit leave | Valid dates + reason | Request created, status "pending" | ✓ Pass |
| Overlapping dates | Dates conflict with existing leave | "Overlaps existing leave" error | ✓ Pass |
| Admin approve | Click approve + add notes | Status → "approved", attendance marked | ✓ Pass |
| Admin reject | Click reject + reason | Status → "rejected", notification sent | ✓ Pass |
| Weekend skip | Approved Mon-Fri leave | Only weekdays marked as "leave" | ✓ Pass |

### Geofence Testing

| Test Case | Office Location | Employee Location | Radius | Result |
|-----------|----------------|-------------------|--------|--------|
| Within radius | 5.6037, -0.187 | 5.6040, -0.186 | 500m | ✓ Allowed |
| Exactly on boundary | 5.6037, -0.187 | 5.6082, -0.187 | 500m | ✓ Allowed |
| Just outside | 5.6037, -0.187 | 5.6090, -0.187 | 500m | ✗ Rejected |
| Far away | 5.6037, -0.187 | 5.7200, -0.210 | 500m | ✗ Rejected (13.4km) |
| Remote work enabled | Any | Any | Any | ✓ Allowed |

### Browser Compatibility

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome 120+ | ✓ | ✓ | Full support |
| Firefox 120+ | ✓ | ✓ | Full support |
| Safari 17+ | ✓ | ✓ | Full support |
| Edge 120+ | ✓ | N/A | Full support |

---

- **Facial recognition** for biometric check-in
- **Shift scheduling** — assign different shifts to employees
- **Overtime tracking** with automatic calculation
- **Mobile app** (React Native) for native push notifications
- **Integration** with payroll systems (hours → salary calculation)
- **Analytics dashboard** with predictive attendance patterns
- **Multi-branch support** — different office locations

---

## SLIDE 29: Future Enhancements

- **Facial recognition** for biometric check-in
- **Shift scheduling** — assign different shifts to employees
- **Overtime tracking** with automatic calculation
- **Mobile app** (React Native) for native push notifications
- **Integration** with payroll systems (hours → salary calculation)
- **Analytics dashboard** with predictive attendance patterns
- **Multi-branch support** — different office locations
- **Leave balance tracking** — annual quotas per leave type
- **Employee self-service** — profile photo upload, document management
- **Webhook integrations** — Slack/Teams notifications

---

## SLIDE 30: Conclusion

### What We Built
A complete workforce management system that:
- **Eliminates buddy punching** through GPS and QR verification
- **Saves admin time** with automated reports and leave management
- **Provides real-time visibility** into attendance across the company
- **Ensures accountability** through audit trails and notifications
- **Scales easily** with cloud deployment and NoSQL database

### Objectives Achieved
| Objective | Status |
|-----------|--------|
| Secure authentication with JWT + OTP | ✅ Achieved |
| GPS geofencing for location verification | ✅ Achieved |
| QR kiosk system for contactless check-in | ✅ Achieved |
| Automated leave management workflow | ✅ Achieved |
| Performance scoring system | ✅ Achieved |
| Reporting module with export | ✅ Achieved |
| PWA accessible on all devices | ✅ Achieved |

### Key Metrics
| Metric | Value |
|--------|-------|
| Total API Endpoints | 26+ |
| Database Models | 10 |
| Frontend Pages | 19 |
| Authentication Methods | JWT + OTP + Email |
| Check-in Methods | 3 (GPS, QR, Manual) |
| Export Formats | PDF, Excel, Print |
| Tech Stack Layers | 8+ |

---

## SLIDE 31: References

### Technologies & Documentation
1. Next.js 15 Documentation — https://nextjs.org/docs
2. React 19 — https://react.dev
3. MongoDB Documentation — https://www.mongodb.com/docs
4. Mongoose ODM — https://mongoosejs.com/docs
5. JSON Web Tokens — https://jwt.io/introduction
6. Tailwind CSS 4 — https://tailwindcss.com/docs
7. Recharts Library — https://recharts.org
8. Nodemailer — https://nodemailer.com
9. Zod Validation — https://zod.dev
10. bcryptjs — https://www.npmjs.com/package/bcryptjs

### Algorithms & Formulas
11. Haversine Formula for GPS distance — https://en.wikipedia.org/wiki/Haversine_formula
12. JWT Token-Based Authentication — RFC 7519

### Libraries Used
13. jsPDF — PDF generation (https://github.com/parallax/jsPDF)
14. SheetJS (xlsx) — Excel generation (https://sheetjs.com)
15. QRCode — QR generation (https://www.npmjs.com/package/qrcode)
16. Lucide React — Icon library (https://lucide.dev)
17. date-fns — Date utilities (https://date-fns.org)
18. shadcn/ui — UI component library (https://ui.shadcn.com)

### Deployment & Hosting
19. Vercel Platform — https://vercel.com/docs
20. MongoDB Atlas — https://www.mongodb.com/atlas

---

## SLIDE 32: Q&A

**Thank you for your attention.**

Questions?

---

## APPENDIX: Quick Reference

### Default Demo Credentials
Set up via the seed script (`scripts/seed-admin.ts`):
- **Admin:** admin@company.com / Admin@1234
- **Employee:** Set up via admin invitation flow

### Running Locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Key Files Reference
| File | Purpose |
|------|---------|
| `lib/geofence.ts` | Haversine distance calculation |
| `lib/jwt.ts` | Token generation/verification |
| `lib/performance.ts` | Score calculation formula |
| `lib/email.ts` | Email templates and sending |
| `lib/security.ts` | Rate limiting, validation |
| `proxy.ts` | Middleware (auth, refresh, role check) |
| `middleware.ts` | Next.js middleware entry point |
| `models/*.ts` | All database schemas |
| `app/api/**` | All backend API routes |
| `app/admin/**` | Admin panel pages |
| `app/employee/**` | Employee portal pages |
| `app/kiosk/page.tsx` | Public QR check-in kiosk |

