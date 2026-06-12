import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOfficeQR extends Document {
  qrToken: string;
  label: string;
  isActive: boolean;
  createdBy: string;
  scansToday: number;
  createdAt: Date;
  updatedAt: Date;
}

const officeQRSchema = new Schema<IOfficeQR>(
  {
    qrToken: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      default: 'Main Entrance',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    scansToday: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

officeQRSchema.index({ isActive: 1 });
officeQRSchema.index({ qrToken: 1 });

export const OfficeQR: Model<IOfficeQR> =
  mongoose.models.OfficeQR || mongoose.model<IOfficeQR>('OfficeQR', officeQRSchema);
