import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  _id: string;
  companyName: string;
  officeLocation: {
    latitude: number;
    longitude: number;
  };
  geofenceRadius: number; // in meters
  workingHoursStart: string; // HH:mm format (e.g., "09:00")
  workingHoursEnd: string; // HH:mm format (e.g., "18:00")
  lateMarginMinutes: number; // minutes allowed before marking as late
  breakDurationMinutes: number;
  expectedWorkingHoursPerDay: number; // hours
  timezone: string;
  allowRemoteWork: boolean;
  requireGPSVerification: boolean;
  requirePhotoVerification: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    companyName: {
      type: String,
      required: true,
      default: 'My Company',
    },
    officeLocation: {
      latitude: {
        type: Number,
        required: true,
        default: 28.5244, // Example: New Delhi
      },
      longitude: {
        type: Number,
        required: true,
        default: 77.1855,
      },
    },
    geofenceRadius: {
      type: Number,
      default: 500, // 500 meters
    },
    workingHoursStart: {
      type: String,
      default: '09:00',
    },
    workingHoursEnd: {
      type: String,
      default: '18:00',
    },
    lateMarginMinutes: {
      type: Number,
      default: 15,
    },
    breakDurationMinutes: {
      type: Number,
      default: 60,
    },
    expectedWorkingHoursPerDay: {
      type: Number,
      default: 8,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    allowRemoteWork: {
      type: Boolean,
      default: false,
    },
    requireGPSVerification: {
      type: Boolean,
      default: true,
    },
    requirePhotoVerification: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);
