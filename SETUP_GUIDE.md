# Smart Attendance System - Complete Setup Guide

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier)
- Gmail account with app-specific password
- Vercel account (for deployment)

## Step 1: MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and sign in
3. Create a new cluster (select Free tier)
4. Create a database user:
   - Go to Database Access
   - Click "Add New Database User"
   - Note down username and password
5. Get connection string:
   - Go to Databases
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
6. Replace `<username>` and `<password>` with your database user credentials

## Step 2: Email Configuration

### Using Gmail:
1. Go to [Google Account](https://myaccount.google.com)
2. Enable 2-factor authentication
3. Create an app-specific password:
   - Go to Security settings
   - Find "App passwords" (requires 2FA)
   - Select Mail and Windows Computer
   - Copy the generated 16-character password

## Step 3: Generate JWT Secrets

Run these commands to generate secure random strings:

```bash
# Generate JWT Secret (copy the output)
openssl rand -base64 32

# Generate Refresh Token Secret (copy the output)
openssl rand -base64 32
```

## Step 4: Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/attendance-system?retryWrites=true&w=majority

# JWT Secrets (from Step 3)
JWT_SECRET=your-generated-jwt-secret-here
REFRESH_TOKEN_SECRET=your-generated-refresh-token-here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Optional: API URL (for PWA and deployment)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Step 5: Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

## Step 6: Database Initialization

The application will automatically create indexes when it first connects to MongoDB.

To verify the connection, start the dev server:

```bash
pnpm dev
```

Visit `http://localhost:3000` - you should see the login page.

## Step 7: Create Admin Account

### Option A: Using API (Recommended)

1. Start the server: `pnpm dev`
2. Open terminal and run:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "AdminPassword123!",
    "name": "Admin User",
    "role": "admin",
    "department": "Management"
  }'
```

### Option B: Direct Database Insert

Connect to MongoDB and insert an admin user:

```javascript
// Use MongoDB Compass or MongoDB Shell
db.users.insertOne({
  email: "admin@company.com",
  password: "$2b$10$...", // bcrypt hash of your password
  name: "Admin User",
  role: "admin",
  department: "Management",
  position: "Administrator",
  isActive: true,
  leaveBalance: 20,
  createdAt: new Date()
})
```

## Step 8: First Login

1. Go to `http://localhost:3000/auth/login`
2. Enter admin email and password
3. You'll be redirected to admin dashboard

## Step 9: Configure Company Settings

1. Go to Admin Dashboard → Settings
2. Configure:
   - Company Name
   - Company Address
   - Working Hours (start/end time)
   - Geofence location (latitude, longitude)
   - Geofence radius (in meters)
   - Feature toggles

## Step 10: Invite Employees

1. Go to Admin Dashboard → Employees
2. Click "Invite Employee" button
3. Enter employee email, name, department, position
4. Employee will receive invitation email
5. They click the link and set their password
6. They complete OTP verification
7. Employee account is active

## Running the Application

### Development

```bash
pnpm dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm start
```

## Features Overview

### For Admins
- ✅ Dashboard with real-time analytics
- ✅ Employee management (invite, edit, deactivate)
- ✅ Attendance tracking and manual corrections
- ✅ Leave request approval workflow
- ✅ Performance analytics and rankings
- ✅ PDF/Excel report generation
- ✅ Company settings configuration
- ✅ Audit logs and activity tracking

### For Employees
- ✅ Check-in/check-out with QR or GPS
- ✅ View attendance history
- ✅ Submit and track leave requests
- ✅ Edit personal profile
- ✅ View performance score and ranking
- ✅ Real-time notifications
- ✅ Offline support (PWA)

## Advanced Features

### Geofencing
- Employees can only check-in within configured radius
- Automatic GPS validation
- Admin can edit geofence settings

### QR Code
- Admin generates daily QR codes
- Employees scan to check-in
- Prevents unauthorized check-ins

### Performance Scoring
- Formula: (Attendance × 40%) + (Hours × 40%) + (Punctuality × 20%)
- Real-time calculations
- Department-wise comparisons

### Report Generation
- PDF reports with company branding
- Excel exports with formulas
- Department and date filtering
- Include all performance metrics

### Notifications
- Real-time notifications for leave approvals
- Attendance reminders
- Leave status updates
- Automatic cleanup (30-day retention)

### Email Notifications
Automatically sent for:
- Leave requests (to admin)
- Leave approvals (to employee)
- Invitation links (to new employees)
- Password reset links

## Troubleshooting

### "Can't resolve '@/lib/jwt'"
- Make sure all files are in correct directories:
  - `/src/lib/` for utilities
  - `/src/models/` for database models
  - `/src/components/` for React components
  - `/src/app/` for Next.js pages/API routes
  - `/src/hooks/` for custom hooks

### MongoDB Connection Failed
- Check MONGODB_URI is correct
- Verify MongoDB Atlas network access includes your IP
- Ensure database user credentials are correct
- Check firewall/proxy settings

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail: Ensure app-specific password is used (not main password)
- Check SMTP settings in email.ts
- Enable "Less secure app access" if not using app password

### Authentication Issues
- Clear cookies: DevTools → Application → Cookies
- Check JWT_SECRET and REFRESH_TOKEN_SECRET are set
- Verify tokens expire times in jwt.ts

### Geofencing Not Working
- Check latitude/longitude are correctly formatted
- Ensure geofence radius is set in Settings
- Test with GPS permission granted
- Check browser console for geolocation errors

## Deployment to Vercel

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. Import to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Add environment variables (same as .env.local)
   - Click Deploy

3. Update NEXT_PUBLIC_API_URL to your Vercel domain

## Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens with secure secrets
- ✅ HTTP-only cookies for token storage
- ✅ CORS and CSRF protection
- ✅ Input validation with Zod
- ✅ Rate limiting on sensitive endpoints
- ✅ Audit logging for all actions
- ✅ OTP verification for new accounts
- ✅ Password reset tokens with expiry
- ✅ Role-based access control (RBAC)

## Performance Tips

1. **Database Indexes**: Already created on userId, date fields
2. **Pagination**: Use limit/skip on large result sets
3. **Caching**: Consider Redis for frequently accessed data
4. **Image Optimization**: Use Next.js Image component
5. **Database Queries**: Use aggregation pipeline for complex queries

## Support & Documentation

- Full API documentation: `/API_DOCUMENTATION.md`
- Database models: `/src/models/`
- Utility functions: `/src/lib/`
- Configuration: `/.env.local`

## Next Steps

1. Test all features with test accounts
2. Configure email templates (in email.ts)
3. Customize company branding
4. Set up analytics dashboard
5. Train admin users
6. Deploy to production

Happy tracking! 🎯
