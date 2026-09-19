import prisma from '../../config/db.js';

export const getLineageForUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { rollNumber, program, branch, college, batchYear } = user;

  if (rollNumber === null || rollNumber === undefined) {
    return {
      currentBatch: batchYear,
      rollNumber: null,
      generations: [],
    };
  }

  // Find all students across batches with this roll number
  const students = await prisma.user.findMany({
    where: {
      rollNumber,
      program,
      branch,
      college,
    },
    include: {
      resources: {
        where: { isApproved: true },
        select: {
          id: true,
          title: true,
          category: true,
          subject: true,
          fileType: true,
          createdAt: true,
        },
      },
      contributions: true,
      answers: {
        select: { id: true },
      },
      streak: true,
    },
    orderBy: {
      batchYear: 'desc',
    },
  });

  // Build the generation list
  const generations = students.map((s) => ({
    userId: s.id,
    batch: s.batchYear,
    roll: s.rollNumber,
    label: s.id === user.id ? 'You' : s.name,
    name: s.name,
    initials: s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    you: s.id === user.id,
    role: s.id === user.id ? 'Current Student' : s.batchYear === (user.batchYear || 0) - 1 ? 'Corres' : s.role,
    contributions: s.contributions.length,
    resources: s.resources.length,
    answersCount: s.answers.length,
    streak: s.streak,
    resourcesList: s.resources,
  }));

  return {
    currentBatch: batchYear,
    rollNumber,
    generations,
  };
};

export const getLineageResources = async (userId) => {
  const lineage = await getLineageForUser(userId);
  const userIds = lineage.generations.map((g) => g.userId);

  return await prisma.resource.findMany({
    where: {
      contributorId: { in: userIds },
      isApproved: true,
    },
    include: {
      contributor: {
        select: { id: true, name: true, batchYear: true, rollNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getLineageContributions = async (userId) => {
  const lineage = await getLineageForUser(userId);
  const userIds = lineage.generations.map((g) => g.userId);

  return await prisma.contribution.findMany({
    where: {
      userId: { in: userIds },
    },
    include: {
      user: {
        select: { id: true, name: true, batchYear: true, rollNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export default {
  getLineageForUser,
  getLineageResources,
  getLineageContributions,
};

