import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveBalance extends Document {
  userId: string;
  year: number;
  annual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  casual: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
  emergency: { total: number; used: number; remaining: number };
  createdAt: Date;
  updatedAt: Date;
}

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
    },
    annual: {
      total: { type: Number, default: 21 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 21 },
    },
    sick: {
      total: { type: Number, default: 10 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 10 },
    },
    casual: {
      total: { type: Number, default: 7 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 7 },
    },
    personal: {
      total: { type: Number, default: 5 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 5 },
    },
    emergency: {
      total: { type: Number, default: 3 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 3 },
    },
  },
  {
    timestamps: true,
  }
);

leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

export const LeaveBalance: Model<ILeaveBalance> =
  mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);
