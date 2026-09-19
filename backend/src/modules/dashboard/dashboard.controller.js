import prisma from '../../config/db.js';
import { getLineageForUser } from '../lineage/lineage.service.js';

export const getStudentDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    // 1. Assigned Corres
    const assignment = await prisma.corresAssignment.findFirst({
      where: { juniorId: user.id, status: 'ACTIVE' },
      include: {
        senior: {
          select: {
            id: true,
            name: true,
            email: true,
            batchYear: true,
            rollNumber: true,
            headline: true,
            bio: true,
          },
        },
      },
    });

    // 2. Generational history preview
    let lineagePreview = [];
    if (user.rollNumber !== null && user.rollNumber !== undefined) {
      const lineage = await getLineageForUser(user.id);
      lineagePreview = lineage.generations.slice(0, 3);
    }

    // 3. Recent resources
    const recentResources = await prisma.resource.findMany({
      where: { isApproved: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        contributor: {
          select: { id: true, name: true, batchYear: true },
        },
      },
    });

    // 4. Recent questions
    const recentQuestions = await prisma.question.findMany({
      where: { isReported: false },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        answers: { select: { id: true } },
      },
    });

    // 5. Recent notifications
    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      corres: assignment
        ? {
            id: assignment.senior.id,
            name: assignment.senior.name,
            initials: assignment.senior.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
            batch: assignment.senior.batchYear,
            roll: assignment.senior.rollNumber,
            headline: assignment.senior.headline || 'Senior Mentor',
            type: assignment.type,
            online: true,
          }
        : null,
      lineage: lineagePreview,
      recentResources: recentResources.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        subject: r.subject,
        type: r.fileType,
        contributor: r.contributor.name,
        batch: r.batchYear,
        date: new Date(r.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }),
      })),
      recentQuestions: recentQuestions.map((q) => ({
        id: q.id,
        title: q.title,
        subject: q.subject,
        answers: q.answers.length,
        time: formatRelativeTime(q.createdAt),
      })),
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        time: formatRelativeTime(n.createdAt),
        read: n.isRead,
        icon: n.type === 'message' ? 'message' : n.type === 'answer' ? 'check' : 'book',
        tone: n.type === 'message' ? 'brass' : n.type === 'answer' ? 'sage' : 'slate',
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getSeniorDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    // 1. Assigned juniors
    const assignments = await prisma.corresAssignment.findMany({
      where: { seniorId: user.id, status: 'ACTIVE' },
      include: {
        junior: {
          select: {
            id: true,
            name: true,
            batchYear: true,
            rollNumber: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    const juniors = assignments.map((a) => ({
      id: a.junior.id,
      name: a.junior.name,
      initials: a.junior.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
      batch: a.junior.batchYear,
      roll: a.junior.rollNumber,
      type: a.type,
      questions: a.junior._count.questions,
    }));

    // 2. Streak
    let streak = await prisma.streak.findUnique({ where: { userId: user.id } });
    if (!streak) {
      streak = await prisma.streak.create({
        data: { userId: user.id, currentStreak: 0, longestStreak: 0, thisMonthCount: 0 },
      });
    }

    const resourcesShared = await prisma.resource.count({ where: { contributorId: user.id } });
    const questionsAnswered = await prisma.answer.count({ where: { authorId: user.id } });

    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;
    if (currentStreak === 0 && (resourcesShared > 0 || questionsAnswered > 0)) {
      currentStreak = 1;
      if (longestStreak < 1) longestStreak = 1;
      await prisma.streak.update({
        where: { userId: user.id },
        data: { currentStreak: 1, longestStreak, lastContributionDate: new Date() },
      });
    }

    // 3. Recent questions from juniors
    const recentQuestions = await prisma.question.findMany({
      where: { isReported: false },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        answers: { select: { id: true, isAccepted: true } },
      },
    });

    res.json({
      success: true,
      juniors,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        thisMonth: Math.max(streak.thisMonthCount, resourcesShared + questionsAnswered),
        resourcesShared,
        questionsAnswered,
      },
      recentQuestions: recentQuestions.map((q) => ({
        id: q.id,
        title: q.title,
        subject: q.subject,
        answers: q.answers.length,
        accepted: q.answers.some((a) => a.isAccepted),
        time: formatRelativeTime(q.createdAt),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      students,
      seniors,
      batches,
      resources,
      sameRoll,
      fallback,
      contributions,
      pendingModeration,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: { in: ['SENIOR', 'ALUMNI'] } } }),
      prisma.batch.count(),
      prisma.resource.count(),
      prisma.corresAssignment.count({ where: { type: 'SAME_ROLL' } }),
      prisma.corresAssignment.count({ where: { type: 'FALLBACK_TOP_PERFORMER' } }),
      prisma.contribution.count(),
      prisma.moderationReport.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      stats: {
        students,
        seniors,
        batches,
        resources,
        sameRoll,
        fallback,
        contributions,
        pending: pendingModeration,
      },
    });
  } catch (error) {
    next(error);
  }
};

function formatRelativeTime(date) {
  const diffSec = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default {
  getStudentDashboard,
  getSeniorDashboard,
  getAdminDashboard,
};

