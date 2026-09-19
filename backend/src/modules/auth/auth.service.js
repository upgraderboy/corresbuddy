import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { signToken } from '../../config/jwt.js';
import { assignCorresForJunior } from '../corres/corres.service.js';

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
  } = data;

  if (!email || !password || !name) {
    throw new Error('Name, email and password are required.');
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error('User already exists with this email address.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const parsedBatch = batch ? parseInt(batch, 10) : null;
  const parsedRoll = rollNumber !== undefined && rollNumber !== null ? parseInt(rollNumber, 10) : null;

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      college,
      program,
      branch,
      batchYear: parsedBatch,
      rollNumber: parsedRoll,
      bio,
      status: 'ACTIVE',
    },
  });

  // Initialize streak for user
  await prisma.streak.create({
    data: {
      userId: user.id,
      currentStreak: 0,
      longestStreak: 0,
      thisMonthCount: 0,
    },
  });

  // Ensure Batch entity exists
  if (parsedBatch) {
    await prisma.batch.upsert({
      where: {
        year_program_branch: {
          year: parsedBatch,
          program,
          branch,
        },
      },
      update: {},
      create: {
        year: parsedBatch,
        program,
        branch,
        college,
        status: parsedBatch >= 2024 ? 'ACTIVE' : 'ALUMNI',
      },
    });
  }

  // Automatic Corres assignment for junior student
  let corresAssignment = null;
  if (role === 'STUDENT' && parsedBatch && parsedRoll !== null) {
    try {
      corresAssignment = await assignCorresForJunior(user.id);
    } catch (err) {
      console.warn('Initial Corres assignment deferred:', err.message);
    }
  }

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
  };

  return {
    user: safeUser,
    token,
    corresAssignment,
  };
};

export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
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
    corres: user.assignmentsAsJunior[0]?.senior || null,
    assignmentType: user.assignmentsAsJunior[0]?.type || null,
    assignedJuniors: user.assignmentsAsSenior.map((a) => a.junior),
  };
};

export default {
  register,
  login,
  getMe,
};

