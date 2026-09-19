import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { signToken } from '../../config/jwt.js';
import { assignCorresForJunior } from '../corres/corres.service.js';
import { parseAndValidateEmail } from '../../utils/emailParser.js';
import { sendWelcomeEmail, sendLoginNotificationEmail, sendVerificationOtpEmail } from '../../services/email.service.js';
import otpService from '../../services/otp.service.js';

export const sendOtp = async ({ email, name = 'Student', purpose = 'REGISTER' }) => {
  if (!email) {
    throw new Error('Email is required to send verification code.');
  }

  // Validate institutional domain
  const parsedEmailData = parseAndValidateEmail(email);
  const normalizedEmail = parsedEmailData.normalizedEmail;

  if (purpose === 'REGISTER') {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }
  }

  const { otp, expiresAt } = otpService.generateOtp(normalizedEmail, purpose);

  // Send confirmation email
  await sendVerificationOtpEmail({
    email: normalizedEmail,
    name,
    otp,
    purpose: purpose.toLowerCase(),
  });

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}.`,
    expiresAt,
    // Provide devOtp in non-production for automated testing / smooth verification
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  };
};

export const verifyOtp = async ({ email, code, purpose = 'REGISTER' }) => {
  if (!email || !code) {
    throw new Error('Email and verification code are required.');
  }

  const result = otpService.verifyOtp(email, code, purpose);
  if (!result.valid) {
    throw new Error(result.error || 'Invalid verification code.');
  }

  return {
    success: true,
    message: 'Email verified successfully.',
  };
};

export const register = async (data) => {
  const {
    name,
    email,
    password,
    role = 'STUDENT',
    college = 'VIT Vellore',
    program = 'MCA',
    branch = 'Computer Applications',
    batch = 2026,
    rollNumber = 9,
    bio,
    otp,
  } = data;

  if (!email || !password || !name) {
    throw new Error('Name, email and password are required.');
  }

  // 1. Strict Institutional Domain Validation & Academic Data Parsing
  const parsedEmailData = parseAndValidateEmail(email);
  const normalizedEmail = parsedEmailData.normalizedEmail;

  // 2. If OTP is passed, verify it
  if (otp) {
    const otpResult = otpService.verifyOtp(normalizedEmail, otp, 'REGISTER');
    if (!otpResult.valid) {
      throw new Error(otpResult.error || 'Invalid or expired verification code.');
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error('User already exists with this email address.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Derive academic details from email if available (prevents spoofing)
  const finalCollege = parsedEmailData.college || college;
  const finalProgram = parsedEmailData.program || program;
  const finalBranch = parsedEmailData.branch || branch;
  const finalBatch = parsedEmailData.batchYear || parseInt(batch, 10);
  const finalRoll = parsedEmailData.rollNumber !== undefined ? parsedEmailData.rollNumber : parseInt(rollNumber, 10);
  const finalRole = parsedEmailData.role || role;

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: finalRole,
      college: finalCollege,
      program: finalProgram,
      branch: finalBranch,
      batchYear: finalBatch,
      rollNumber: finalRoll,
      bio,
      status: 'ACTIVE',
      streak: {
        create: {
          currentStreak: 0,
          longestStreak: 0,
          thisMonthCount: 0,
        },
      },
    },
    include: {
      streak: true,
    },
  });

  // Ensure Batch entity exists
  if (finalBatch && finalProgram && finalBranch) {
    await prisma.batch.upsert({
      where: {
        year_program_branch: {
          year: finalBatch,
          program: finalProgram,
          branch: finalBranch,
        },
      },
      update: {},
      create: {
        year: finalBatch,
        program: finalProgram,
        branch: finalBranch,
        college: finalCollege,
        status: finalBatch >= 2024 ? 'ACTIVE' : 'ALUMNI',
      },
    });
  }

  // Automatic Corres assignment for junior student
  let corresAssignment = null;
  if (finalRole === 'STUDENT' && finalBatch && finalRoll !== null) {
    try {
      corresAssignment = await assignCorresForJunior(user.id);
    } catch (err) {
      console.warn('Initial Corres assignment deferred:', err.message);
    }
  }

  // Trigger welcome email asynchronously
  sendWelcomeEmail({
    email: user.email,
    name: user.name,
    college: user.college,
    program: user.program,
    batchYear: user.batchYear,
    rollNumber: user.rollNumber,
    corresName: corresAssignment?.senior?.name || null,
  }).catch((e) => console.error('[Email] Background welcome email error:', e.message));

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    program: user.program,
    branch: user.branch,
    batchYear: user.batchYear,
    rollNumber: user.rollNumber,
    bio: user.bio,
    headline: user.headline,
    status: user.status,
    isTopPerformer: user.isTopPerformer,
    streak: user.streak,
    streakCount: user.streak?.currentStreak || 0,
    longestStreak: user.streak?.longestStreak || 0,
  };

  return {
    user: safeUser,
    token,
    corresAssignment,
  };
};

export const login = async (email, password, clientInfo = {}) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // Validate domain on login
  const parsedEmailData = parseAndValidateEmail(email);
  const normalizedEmail = parsedEmailData.normalizedEmail;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      streak: true,
      assignmentsAsJunior: {
        where: { status: 'ACTIVE' },
        include: { senior: true },
      },
      assignmentsAsSenior: {
        where: { status: 'ACTIVE' },
        include: { junior: true },
      },
    },
  });

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  if (user.status === 'SUSPENDED') {
    throw new Error('Your account has been suspended. Please contact the administrator.');
  }

  // Trigger security notification email asynchronously
  sendLoginNotificationEmail({
    email: user.email,
    name: user.name,
    ip: clientInfo.ip || '127.0.0.1',
    userAgent: clientInfo.userAgent || 'Web Client',
  }).catch((e) => console.error('[Email] Background login alert error:', e.message));

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    program: user.program,
    branch: user.branch,
    batchYear: user.batchYear,
    rollNumber: user.rollNumber,
    bio: user.bio,
    headline: user.headline,
    status: user.status,
    isTopPerformer: user.isTopPerformer,
    streak: user.streak,
    streakCount: user.streak?.currentStreak || 0,
    longestStreak: user.streak?.longestStreak || 0,
    corres: user.assignmentsAsJunior[0]?.senior || null,
    assignmentType: user.assignmentsAsJunior[0]?.type || null,
    juniorsCount: user.assignmentsAsSenior.length,
  };

  return {
    user: safeUser,
    token,
  };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      streak: true,
      assignmentsAsJunior: {
        where: { status: 'ACTIVE' },
        include: { senior: true },
      },
      assignmentsAsSenior: {
        where: { status: 'ACTIVE' },
        include: { junior: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    program: user.program,
    branch: user.branch,
    batchYear: user.batchYear,
    rollNumber: user.rollNumber,
    bio: user.bio,
    headline: user.headline,
    status: user.status,
    isTopPerformer: user.isTopPerformer,
    streak: user.streak,
    streakCount: user.streak?.currentStreak || 0,
    longestStreak: user.streak?.longestStreak || 0,
    corres: user.assignmentsAsJunior[0]?.senior || null,
    assignmentType: user.assignmentsAsJunior[0]?.type || null,
    assignedJuniors: user.assignmentsAsSenior.map((a) => a.junior),
  };
};

export default {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe,
};
