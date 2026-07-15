import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  indexNumber: string; // Format: 5221040001 - 5221040800
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
  classId?: string; // Auto-assigned based on index number
  className?: string; // e.g., "Class A", "Class B"
  role: 'admin' | 'lecturer' | 'teaching_assistant' | 'student';
  department?: string; // For lecturers/admins
  designation?: string; // For lecturers/admins
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  sessionSuspended?: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    indexNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null for non-student roles
      match: /^522104\d{4}$/, // Validates 5221040001-5221040800
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    phone: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    classId: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'lecturer', 'teaching_assistant', 'student'],
      default: 'student',
    },
    department: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    sessionSuspended: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
studentSchema.index({ indexNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ role: 1 });
studentSchema.index({ className: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ department: 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function (this: IStudent) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Calculate class assignment based on index number
 * 5221040001 - 5221040100 = Class A
 * 5221040101 - 5221040199 = Class B
 * 5221040200 - 5221040299 = Class C
 * etc.
 */
studentSchema.pre('save', function (this: IStudent, next) {
  if (this.indexNumber && this.role === 'student') {
    const lastThreeDigits = parseInt(this.indexNumber.slice(-4));
    const classIndex = Math.floor(lastThreeDigits / 100);
    const classLetter = String.fromCharCode(65 + classIndex); // A=65, B=66, etc.
    this.className = `Class ${classLetter}`;
    this.classId = classLetter;
  }
  next();
});

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
