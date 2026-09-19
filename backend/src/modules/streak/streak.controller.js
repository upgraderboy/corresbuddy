import prisma from '../../config/db.js';
import { updateStreakForUser } from '../contributions/contributions.service.js';

export const getMyStreak = async (req, res, next) => {
  try {
    let streak = await prisma.streak.findUnique({
      where: { userId: req.user.id },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId: req.user.id,
          currentStreak: 0,
          longestStreak: 0,
          thisMonthCount: 0,
        },
      });
    }

    const resourcesShared = await prisma.resource.count({
      where: { contributorId: req.user.id },
    });

    const questionsAnswered = await prisma.answer.count({
      where: { authorId: req.user.id },
    });

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;

    if (currentStreak === 0 && (resourcesShared > 0 || questionsAnswered > 0)) {
      currentStreak = 1;
      if (longestStreak < 1) longestStreak = 1;
      await prisma.streak.update({
        where: { userId: req.user.id },
        data: { currentStreak: 1, longestStreak, lastContributionDate: new Date() },
      });
    }

    res.json({
      success: true,
      currentStreak,
      longestStreak,
      lastContribution: streak.lastContributionDate || new Date(),
      thisMonth: Math.max(streak.thisMonthCount, resourcesShared + questionsAnswered),
      resourcesShared,
      questionsAnswered,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStreak = async (req, res, next) => {
  try {
    const streak = await prisma.streak.findUnique({
      where: { userId: req.params.userId },
    });
    res.json({ success: true, streak: streak || { currentStreak: 0, longestStreak: 0 } });
  } catch (error) {
    next(error);
  }
};

export const updateStreak = async (req, res, next) => {
  try {
    const streak = await updateStreakForUser(req.user.id);
    res.json({ success: true, streak });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyStreak,
  getUserStreak,
  updateStreak,
};

