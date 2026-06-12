import { z } from 'zod';

// Auth validation schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and numbers'
  ),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and numbers'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Leave validation schemas
export const LeaveRequestSchema = z.object({
  startDate: z.string().refine(
    (date) => new Date(date) > new Date(),
    'Start date must be in the future'
  ),
  endDate: z.string(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  type: z.enum(['sick', 'personal', 'vacation', 'emergency']),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

// Employee validation schemas
export const InviteEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
});

export const EditProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// Settings validation schemas
export const SettingsSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyAddress: z.string().min(5, 'Company address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5,}$/, 'Invalid zip code'),
  workingHoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  workingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  geofenceLatitude: z.coerce.number().min(-90).max(90),
  geofenceLogitude: z.coerce.number().min(-180).max(180),
  geofenceRadius: z.coerce.number().min(10).max(10000, 'Radius must be between 10-10000 meters'),
  enableQRCode: z.boolean().default(true),
  enableGeofence: z.boolean().default(true),
  enableLeaveApproval: z.boolean().default(true),
  enableNotifications: z.boolean().default(true),
});

// OTP validation
export const OTPSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

// Forgot password schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Helper function to format validation errors
export function formatValidationError(error: z.ZodError) {
  const formattedErrors: Record<string, string> = {};
  (error as any).errors?.forEach((err: any) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  return formattedErrors;
}

// Type exports for form usage
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type LeaveRequestInput = z.infer<typeof LeaveRequestSchema>;
export type InviteEmployeeInput = z.infer<typeof InviteEmployeeSchema>;
export type EditProfileInput = z.infer<typeof EditProfileSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;
export type OTPInput = z.infer<typeof OTPSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
