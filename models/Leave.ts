import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
  userId: string;
  leaveType: 'sick' | 'casual' | 'personal' | 'emergency' | 'other';
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Date;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'personal', 'emergency', 'other'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: String,
    approvalDate: Date,
    rejectionReason: String,
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

// Create indexes
leaveSchema.index({ userId: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });

export const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', leaveSchema);
