import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPerformance extends Document {
  _id: string;
  userId: string;
  month: Date;
  attendanceRate: number; // 0-100
  hoursWorkedScore: number; // 0-100
  punctualityScore: number; // 0-100
  overallScore: number; // Final weighted score
  daysPresent: number;
  daysPresentOnTime: number;
  daysLate: number;
  daysAbsent: number;
  totalHoursWorked: number;
  expectedHours: number;
  notes?: string;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}

const performanceSchema = new Schema<IPerformance>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: Date,
      required: true,
      index: true,
    },
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    hoursWorkedScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    punctualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    daysPresent: {
      type: Number,
      default: 0,
    },
    daysPresentOnTime: {
      type: Number,
      default: 0,
    },
    daysLate: {
      type: Number,
      default: 0,
    },
    daysAbsent: {
      type: Number,
      default: 0,
    },
    totalHoursWorked: {
      type: Number,
      default: 0,
    },
    expectedHours: {
      type: Number,
      default: 160, // Standard working hours per month (8 hours/day * 20 working days)
    },
    notes: String,
    rank: Number,
  },
  {
    timestamps: true,
  }
);

// Create indexes
performanceSchema.index({ userId: 1, month: 1 }, { unique: true });
performanceSchema.index({ month: 1 });
performanceSchema.index({ overallScore: -1 });
performanceSchema.index({ rank: 1 });

export const Performance: Model<IPerformance> =
  mongoose.models.Performance || mongoose.model<IPerformance>('Performance', performanceSchema);
