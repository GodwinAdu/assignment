import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-attendance';

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

async function seedEmployee() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: 'Employee' });
    console.log('Connected to MongoDB successfully.');

    const employeeEmail = 'employee@company.com';
    const employeePassword = 'Employee@123';

    // Check if employee already exists
    const existing = await User.findOne({ email: employeeEmail });
    if (existing) {
      console.log('Employee user already exists:');
      console.log(`  Email: ${employeeEmail}`);
      console.log(`  Password: ${employeePassword}`);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(employeePassword, salt);

    // Create employee user
    await User.create({
      email: employeeEmail,
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'employee',
      department: 'Engineering',
      designation: 'Software Developer',
      isVerified: true,
      isActive: true,
    });

    console.log('\n✅ Employee user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Login Credentials:');
    console.log(`  Email:    ${employeeEmail}`);
    console.log(`  Password: ${employeePassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding employee:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedEmployee();
