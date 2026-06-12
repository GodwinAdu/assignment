import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQRScan extends Document {
  employeeId: string;
  employeeName: string;
  qrToken: string;
  scanType: 'check_in' | 'check_out';
  scanResult: 'success' | 'failed' | 'already_checked';
  ipAddress?: string;
  userAgent?: string;
  scannedAt: Date;
}

const qrScanSchema = new Schema<IQRScan>(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    qrToken: {
      type: String,
      required: true,
    },
    scanType: {
      type: String,
      enum: ['check_in', 'check_out'],
      required: true,
    },
    scanResult: {
      type: String,
      enum: ['success', 'failed', 'already_checked'],
      default: 'success',
    },
    ipAddress: String,
    userAgent: String,
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

qrScanSchema.index({ scannedAt: -1 });
qrScanSchema.index({ employeeId: 1, scannedAt: -1 });

export const QRScan: Model<IQRScan> =
  mongoose.models.QRScan || mongoose.model<IQRScan>('QRScan', qrScanSchema);
