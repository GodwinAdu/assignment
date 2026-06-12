import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  _id: string;
  userId: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  checkInMethod: 'qr' | 'manual' | 'gps' | 'biometric';
  isPresent: boolean;
  hoursWorked: number;
  status: 'absent' | 'present' | 'late' | 'leave' | 'half-day';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkInTime: Date,
    checkOutTime: Date,
    checkInLocation: {
      latitude: Number,
      longitude: Number,
    },
    checkOutLocation: {
      latitude: Number,
      longitude: Number,
    },
    checkInMethod: {
      type: String,
      enum: ['qr', 'manual', 'gps', 'biometric'],
      default: 'qr',
    },
    isPresent: {
      type: Boolean,
      default: false,
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['absent', 'present', 'late', 'leave', 'half-day'],
      default: 'absent',
    },
    remarks: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);
