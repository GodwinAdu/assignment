export interface OTPData {
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

const otpStore = new Map<string, OTPData>();

export function generateOTP(length: number = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
}

export function storeOTP(email: string, otp: string, expiryMinutes: number = 10): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  otpStore.set(email, {
    code: otp,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
  });

  console.log('[v0] OTP stored for:', email);
}

export function verifyOTP(email: string, providedOTP: string): boolean {
  const otpData = otpStore.get(email);

  if (!otpData) {
    console.log('[v0] OTP not found for:', email);
    return false;
  }

  // Check if OTP has expired
  if (new Date() > otpData.expiresAt) {
    console.log('[v0] OTP expired for:', email);
    otpStore.delete(email);
    return false;
  }

  // Check attempts
  if (otpData.attempts >= otpData.maxAttempts) {
    console.log('[v0] Max OTP attempts exceeded for:', email);
    otpStore.delete(email);
    return false;
  }

  // Verify OTP
  if (otpData.code !== providedOTP) {
    otpData.attempts += 1;
    console.log('[v0] Invalid OTP for:', email, `(${otpData.attempts}/${otpData.maxAttempts})`);
    return false;
  }

  console.log('[v0] OTP verified for:', email);
  otpStore.delete(email);
  return true;
}

export function getOTPAttempts(email: string): { attempts: number; maxAttempts: number } | null {
  const otpData = otpStore.get(email);

  if (!otpData) {
    return null;
  }

  return {
    attempts: otpData.attempts,
    maxAttempts: otpData.maxAttempts,
  };
}

export function deleteOTP(email: string): void {
  otpStore.delete(email);
}
