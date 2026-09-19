import crypto from 'crypto';

/**
 * In-memory OTP Store with TTL expiration
 * Key format: `${purpose}:${email}`
 * Value: { otp, expiresAt, attempts }
 */
const otpStore = new Map();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generates a secure 6-digit OTP for the given email and purpose.
 */
export const generateOtp = (email, purpose = 'REGISTER') => {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${purpose}:${normalizedEmail}`;

  // Generate 6-digit numeric OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(key, {
    otp,
    expiresAt,
    attempts: 0,
  });

  return {
    otp,
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

/**
 * Verifies a submitted OTP for the given email and purpose.
 */
export const verifyOtp = (email, code, purpose = 'REGISTER') => {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${purpose}:${normalizedEmail}`;

  const record = otpStore.get(key);

  if (!record) {
    return {
      valid: false,
      error: 'No verification code found. Please request a new code.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return {
      valid: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return {
      valid: false,
      error: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  if (record.otp !== code.trim()) {
    record.attempts += 1;
    return {
      valid: false,
      error: `Incorrect verification code. ${MAX_ATTEMPTS - record.attempts} attempts remaining.`,
    };
  }

  // OTP verified successfully: remove from store
  otpStore.delete(key);

  return {
    valid: true,
  };
};

/**
 * Check if an active OTP exists for dev inspection
 */
export const getActiveOtp = (email, purpose = 'REGISTER') => {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${purpose}:${normalizedEmail}`;
  const record = otpStore.get(key);
  if (record && Date.now() <= record.expiresAt) {
    return record.otp;
  }
  return null;
};

export default {
  generateOtp,
  verifyOtp,
  getActiveOtp,
};

