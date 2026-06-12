import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string;
  action: string;
  actionType: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  resourceType: string;
  resourceId?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'login', 'logout'],
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    resourceId: String,
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Create indexes for querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
