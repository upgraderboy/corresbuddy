import prisma from '../../config/db.js';
import { assignCorresForJunior } from '../corres/corres.service.js';

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      college: true,
      program: true,
      branch: true,
      batchYear: true,
      rollNumber: true,
      bio: true,
      headline: true,
      profilePhoto: true,
      status: true,
      isTopPerformer: true,
      streak: true,
      createdAt: true,
      _count: {
        select: {
          resources: true,
          questions: true,
          answers: true,
          contributions: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateProfile = async (id, data) => {
  const { name, bio, headline, profilePhoto } = data;
  return await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(headline !== undefined && { headline }),
      ...(profilePhoto !== undefined && { profilePhoto }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      college: true,
      program: true,
      branch: true,
      batchYear: true,
      rollNumber: true,
      bio: true,
      headline: true,
      profilePhoto: true,
    },
  });
};

export const getAcademic = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      college: true,
      program: true,
      branch: true,
      batchYear: true,
      rollNumber: true,
    },
  });

  if (!user) throw new Error('User not found');
  return user;
};

export const updateAcademic = async (id, data) => {
  const { college, program, branch, batch, rollNumber } = data;

  const parsedBatch = batch !== undefined ? parseInt(batch, 10) : undefined;
  const parsedRoll = rollNumber !== undefined ? parseInt(rollNumber, 10) : undefined;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(college && { college }),
      ...(program && { program }),
      ...(branch && { branch }),
      ...(parsedBatch !== undefined && { batchYear: parsedBatch }),
      ...(parsedRoll !== undefined && { rollNumber: parsedRoll }),
    },
  });

  // If student updated roll or batch, re-evaluate Corres assignment
  if (user.role === 'STUDENT' && (parsedBatch !== undefined || parsedRoll !== undefined)) {
    try {
      await assignCorresForJunior(user.id);
    } catch (err) {
      console.warn('Re-assignment after academic update deferred:', err.message);
    }
  }

  return {
    id: user.id,
    college: user.college,
    program: user.program,
    branch: user.branch,
    batchYear: user.batchYear,
    rollNumber: user.rollNumber,
  };
};

export const getUserContributions = async (id) => {
  return await prisma.contribution.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserStreak = async (id) => {
  let streak = await prisma.streak.findUnique({
    where: { userId: id },
  });

  if (!streak) {
    streak = await prisma.streak.create({
      data: {
        userId: id,
        currentStreak: 0,
        longestStreak: 0,
        thisMonthCount: 0,
      },
    });
  }

  return streak;
};

export default {
  getUserById,
  updateProfile,
  getAcademic,
  updateAcademic,
  getUserContributions,
  getUserStreak,
};

