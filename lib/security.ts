import crypto from 'crypto';

/**
 * Rate limiting store (in production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up old entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier);
    return true;
  }

  // Check limit
  if (entry) {
    if (entry.count >= maxAttempts) {
      return false;
    }
    entry.count += 1;
  } else {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
  }

  return true;
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validate coordinates are within reasonable bounds
 */
export function isValidLocation(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Check if location is within geofence
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): boolean {
  // Haversine formula
  const R = 6371000; // Earth radius in meters
  const dLat = ((userLat - centerLat) * Math.PI) / 180;
  const dLng = ((userLng - centerLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((centerLat * Math.PI) / 180) *
      Math.cos((userLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
}

/**
 * Validate API key
 */
export function isValidAPIKey(key: string): boolean {
  return !!key && key.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Get client IP address from request
 */
export function getClientIP(headers: Headers): string {
  return (
    (headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Check if request is from a trusted IP
 */
export function isTrustedIP(ip: string, trustedIPs: string[]): boolean {
  return trustedIPs.includes(ip);
}
