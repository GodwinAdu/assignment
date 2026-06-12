import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { config } from 'dotenv';

// Load .env file
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-attendance';

// Inline User schema to avoid path alias issues when running standalone
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    invitationToken: String,
    invitationTokenExpiry: Date,
    resetTokenHash: String,
    resetTokenExpiry: Date,
    lastLogin: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: 'Employee' });
    console.log('Connected to MongoDB successfully.');

    // Admin credentials
    const adminEmail = 'admin@company.com';
    const adminPassword = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(adminPassword, salt);

    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      phone: '+1234567890',
      role: 'admin',
      department: 'Management',
      designation: 'System Administrator',
      isVerified: true,
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Login Credentials:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
