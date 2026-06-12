# Quick Start Guide - 5 Minutes to Running

## 1. Clone and Install (1 min)
```bash
# Install dependencies
pnpm install
```

## 2. Setup Environment (1 min)
Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/attendance
JWT_SECRET=your-32-char-secret-here
REFRESH_TOKEN_SECRET=your-32-char-secret-here
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 3. Start Dev Server (1 min)
```bash
pnpm dev
```
Visit: http://localhost:3000

## 4. Create Admin Account (1 min)
Via curl:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@company.com",
    "password":"SecurePass123",
    "name":"Admin User"
  }'
```

## 5. Login (1 min)
1. Go to http://localhost:3000/auth/login
2. Enter: admin@company.com / SecurePass123
3. You're in the admin dashboard!

---

## 🎯 What You Can Do Now

### As Admin:
- ✅ View dashboard with analytics
- ✅ Invite employees
- ✅ View attendance records
- ✅ Approve/reject leaves
- ✅ Generate reports
- ✅ Configure settings

### As Employee:
- ✅ Check-in/check-out
- ✅ Request leaves
- ✅ View attendance history
- ✅ Edit profile
- ✅ Get notifications

---

## 📚 Key Features Quick Links

| Feature | URL | Role |
|---------|-----|------|
| Admin Dashboard | /admin/dashboard | Admin |
| Manage Employees | /admin/employees | Admin |
| Attendance Tracking | /admin/attendance | Admin |
| Performance Analytics | /admin/performance | Admin |
| Generate Reports | /admin/reports | Admin |
| Settings | /admin/settings | Admin |
| Employee Dashboard | /employee/dashboard | Employee |
| Check-in/out | /employee/attendance | Employee |
| Request Leave | /employee/leave | Employee |
| View Profile | /employee/profile | Employee |
| Notifications | /notifications | All |

---

## 🔑 Test Accounts

After setup, try inviting an employee:

1. Go to Admin Dashboard → Employees
2. Click "Invite Employee"
3. Enter email, name, department
4. Employee receives invitation email
5. They click link, set password, verify OTP
6. Ready to use!

---

## 🚀 Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# In Vercel:
1. Connect your GitHub repo
2. Add same environment variables
3. Deploy!
```

---

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

**MongoDB connection failed?**
- Check MONGODB_URI is correct
- Whitelist your IP in MongoDB Atlas
- Verify database user credentials

**Email not sending?**
- Use app-specific password (not main Gmail password)
- Enable 2FA on Gmail account
- Check EMAIL_USER and EMAIL_PASSWORD

**Build errors?**
```bash
pnpm clean
pnpm install
pnpm build
```

---

## 📖 Full Documentation

For complete setup and features:
- **Setup Guide**: See SETUP_GUIDE.md
- **API Docs**: See API_DOCUMENTATION.md
- **Full Summary**: See COMPLETION_SUMMARY.md

---

## ⚡ Pro Tips

1. **Dark Theme**: Already enabled by default
2. **Mobile Friendly**: Works on phones with PWA support
3. **QR Code**: Generated daily for check-in (Admin)
4. **Geofencing**: Set location radius in Settings
5. **Reports**: PDF/Excel exports available
6. **Analytics**: Real-time charts update automatically

---

## 🎓 What's Included?

✅ Full authentication system with JWT
✅ Admin & employee dashboards
✅ QR code + GPS check-in
✅ Leave request workflow
✅ Performance analytics
✅ Real-time notifications
✅ PDF/Excel reports
✅ Mobile responsive
✅ PWA ready
✅ Audit logging
✅ Complete documentation

---

## 💡 Next Steps

1. ✅ Run the app (you're here!)
2. Create test accounts
3. Try all features
4. Customize company info
5. Configure geofence
6. Generate test reports
7. Deploy to Vercel
8. Invite real employees

---

**Questions?** Check SETUP_GUIDE.md or API_DOCUMENTATION.md

**Ready to deploy?** Push to GitHub and connect to Vercel

**Happy tracking!** 🎯
