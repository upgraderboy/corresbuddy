import prisma from '../../config/db.js';

export const recordContribution = async ({ userId, type, referenceId, title, batchYear }) => {
  const contribution = await prisma.contribution.create({
    data: {
      userId,
      type,
      referenceId,
      title,
      batchYear,
    },
  });

  // Update streak
  await updateStreakForUser(userId);

  return contribution;
};

export const updateStreakForUser = async (userId) => {
  let streak = await prisma.streak.findUnique({ where: { userId } });
  if (!streak) {
    streak = await prisma.streak.create({
      data: { userId, currentStreak: 0, longestStreak: 0, thisMonthCount: 0 },
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newCurrent = streak.currentStreak;
  let newLongest = streak.longestStreak;

  if (streak.lastContributionDate) {
    const lastDate = new Date(streak.lastContributionDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      // Same day, streak count must be at least 1
      if (newCurrent < 1) {
        newCurrent = 1;
      }
    } else if (diffDays === 1) {
      // Consecutive day
      newCurrent += 1;
    } else {
      // Streak broken, restart at 1
      newCurrent = 1;
    }
  } else {
    // First ever contribution
    newCurrent = 1;
  }

  if (newCurrent > newLongest) {
    newLongest = newCurrent;
  }

  // Calculate contributions this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthCount = await prisma.contribution.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });

  return await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastContributionDate: new Date(),
      thisMonthCount,
    },
  });
};

export const getMyContributions = async (userId) => {
  return await prisma.contribution.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const listContributions = async (filters = {}) => {
  const { user, batch, type } = filters;
  return await prisma.contribution.findMany({
    where: {
      ...(user && { userId: user }),
      ...(batch && { batchYear: parseInt(batch, 10) }),
      ...(type && { type }),
    },
    include: {
      user: {
        select: { id: true, name: true, batchYear: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export default {
  recordContribution,
  updateStreakForUser,
  getMyContributions,
  listContributions,
};

