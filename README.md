# Smart Employee Attendance & Workforce Management System

A comprehensive web application for managing employee attendance, tracking work hours, calculating performance metrics, and managing leave requests with geofencing and QR-based check-in.

## 🎯 Features

### Authentication & Security
- **JWT-based Authentication** - Secure token management with access and refresh tokens
- **Password Hashing** - bcryptjs for secure password storage
- **Email OTP Verification** - Two-factor authentication via email
- **Employee Invitation Flow** - Admins invite employees with secure invitation links
- **Password Reset** - Secure password reset with token-based verification
- **Audit Logging** - Track all system actions and login/logout events
- **Rate Limiting** - Prevent brute force attacks

### Admin Features
- **Employee Management** - Add, edit, view, and manage employee information
- **Attendance Tracking** - View attendance records with filtering and export
- **Performance Analytics** - Employee performance scoring and rankings
  - Attendance Rate (40% weight)
  - Hours Worked Score (40% weight)
  - Punctuality Score (20% weight)
- **Reports** - Generate and download attendance, performance, and leave reports
- **Settings** - Configure company information, office location, working hours, and features
- **Leave Management** - Approve/reject leave requests

### Employee Features
- **Check-In/Out** - Dual methods: QR code scanning and GPS geofencing
- **Attendance History** - View personal attendance records with monthly summaries
- **Leave Requests** - Request different types of leave with reasons
- **Performance Dashboard** - View personal performance metrics and rankings
- **Profile Management** - Update personal information

### Advanced Features
- **Geofencing** - GPS-based location verification (Haversine formula)
- **QR Code Attendance** - Quick check-in via QR scanning
- **Real-time Notifications** - Push notifications for important events
- **Dark Mode** - Professional dark theme with purple accents
- **PWA Support** - Installable web app with offline capabilities
- **Service Worker** - Offline support and background sync
- **Responsive Design** - Works seamlessly on mobile and desktop

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide Icons
- Framer Motion (animations)
- Recharts (charts)

**Backend:**
- Next.js API Routes
- Node.js
- MongoDB with Mongoose
- JWT (Authentication)
- bcryptjs (Password hashing)
- Nodemailer (Email)
- Zod (Validation)

**Infrastructure:**
- Vercel (Deployment)
- MongoDB Atlas (Database)
- Email Service (Gmail/SMTP)

### Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── performance/
│   │   ├── reports/
│   │   └── settings/
│   ├── employee/
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── attendance-history/
│   │   ├── leave/
│   │   └── profile/
│   ├── api/
│   │   ├── auth/
│   │   ├── attendance/
│   │   └── admin/
│   └── layout.tsx
├── lib/
│   ├── mongodb.ts
│   ├── jwt.ts
│   ├── bcrypt.ts
│   ├── email.ts
│   ├── otp.ts
│   ├── geofence.ts
│   ├── performance.ts
│   ├── security.ts
├── models/
│   ├── User.ts
│   ├── Attendance.ts
│   ├── Leave.ts
│   ├── Performance.ts
│   ├── AuditLog.ts
│   └── Settings.ts
├── components/
│   ├── admin/
│   │   └── Sidebar.tsx
│   ├── employee/
│   │   └── Sidebar.tsx
│   └── PWAProvider.tsx
├── middleware.ts
└── types/
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB Atlas account
- Gmail account (for sending emails)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/attendance-system.git
   cd attendance-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Update `.env.local` with your values:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-db
   JWT_SECRET=your-secret-key-min-32-chars
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NODE_ENV=development
   ```

5. **Generate JWT secrets (for development)**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Run development server**
   ```bash
   pnpm dev
   ```

7. **Open browser**
   ```
   http://localhost:3000
   ```

## 📝 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT signing (min 32 chars) | Yes |
| REFRESH_TOKEN_SECRET | Secret for refresh tokens | Yes |
| EMAIL_USER | Sender email address | Yes |
| EMAIL_PASSWORD | Email password or app-specific password | Yes |
| NEXT_PUBLIC_API_URL | Frontend API URL | No |
| NODE_ENV | Environment (development/production) | No |

### Email Configuration

The system uses Nodemailer for email. Configure with:

**Gmail:**
1. Enable 2FA on your Gmail account
2. Generate [App Password](https://support.google.com/accounts/answer/185833)
3. Use the app password in `EMAIL_PASSWORD`

**Other providers:**
Modify `/src/lib/email.ts` to configure different email service:
```typescript
const transporter = nodemailer.createTransport({
  service: 'your-service',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## 🔐 Security Features

- **Password Security**: bcryptjs hashing with salt rounds
- **JWT Tokens**: 15-minute access tokens, 7-day refresh tokens
- **HTTPS Only**: Secure cookies with httpOnly flag
- **Rate Limiting**: 5 attempts per 60 seconds
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in with Next.js
- **SQL Injection Prevention**: Parameterized queries with Mongoose
- **XSS Protection**: Input sanitization
- **Audit Logging**: Track all user actions
- **Geofencing**: GPS-based location verification

## 🎨 Customization

### Theme Colors

Edit `/app/globals.css` to customize the dark theme:

```css
.dark {
  --primary: oklch(0.55 0.2 265); /* Purple accent */
  --background: oklch(0.1 0 0); /* Very dark charcoal */
  /* ... other colors ... */
}
```

### Company Settings

Configure in the Admin Settings page:
- Company name
- Office location (latitude/longitude)
- Geofence radius (meters)
- Working hours
- Break duration
- Expected working hours per day
- Feature flags (remote work, GPS verification)

## 📊 Performance Scoring Formula

```
Overall Score = (Attendance Rate × 0.4) + (Hours Worked Score × 0.4) + (Punctuality Score × 0.2)

Where:
- Attendance Rate = (Days Present / Total Working Days) × 100
- Hours Worked Score = (Actual Hours / Expected Hours) × 100
- Punctuality Score = (Days On Time / Total Days Present) × 100
```

**Ratings:**
- Excellent: ≥ 90%
- Good: 75-89%
- Average: 60-74%
- Poor: < 60%

## 🚢 Deployment

### Deploy to Vercel

1. **Connect GitHub repository**
   ```bash
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Import new project
   - Connect your GitHub repository
   - Configure environment variables

3. **Set environment variables in Vercel**
   - Add all variables from `.env.local`
   - Ensure URLs match your domain

4. **Deploy**
   ```bash
   vercel deploy --prod
   ```

### Database Backup

Backup your MongoDB data regularly:
```bash
mongodump --uri="your-mongodb-uri" --out=backup/
```

## 📱 PWA Features

The app is installable as a Progressive Web App:

1. **Install on Home Screen**
   - Mobile: Tap "Add to Home Screen"
   - Desktop: Click install icon in address bar

2. **Offline Support**
   - Service worker caches key pages
   - Network-first strategy for API calls
   - Offline fallback pages

3. **Home Screen Shortcuts**
   - Quick access to Check In
   - Quick access to Attendance History

## 🔍 Monitoring & Logs

### Application Logs

Check `/user_read_only_context/v0_debug_logs.log` for:
- Server logs
- Client errors
- API request/response logs

### Audit Logs

View in database - all actions are logged:
- User logins/logouts
- Check-in/out events
- Employee management actions
- Settings changes

## 🤝 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/invite-employee` - Admin invites employee
- `POST /api/auth/accept-invitation` - Employee accepts invitation
- `POST /api/auth/verify-otp` - Verify OTP

### Attendance Endpoints

- `POST /api/attendance/check-in` - Check in with location/QR
- `POST /api/attendance/check-out` - Check out with location

### Admin Endpoints

- `GET /api/admin/employees` - Get all employees
- `POST /api/admin/employees` - Create/update employee

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify connection string in `.env.local`
- Check IP whitelist in MongoDB Atlas
- Ensure database exists

### Email Not Sending
- Verify email credentials
- For Gmail: Check app password (2FA required)
- Check email logs in console

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiry time
- Clear cookies and re-login

### Geofence Not Working
- Verify coordinates are within ±90/±180 range
- Check radius in settings (default 500m)
- Ensure GPS permission is granted

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Guide](https://jwt.io/introduction)
- [Geofencing Algorithm](https://en.wikipedia.org/wiki/Haversine_formula)

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email support@attendancesystem.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with Next.js and React
- Icons from Lucide React
- UI Components inspired by Vercel design system
- Charts powered by Recharts

---

**Last Updated:** June 2024  
**Version:** 1.0.0
