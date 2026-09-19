import prisma from '../../config/db.js';

export const search = async (req, res, next) => {
  try {
    const { q = '', type = 'all' } = req.query;

    if (!q.trim()) {
      return res.json({
        success: true,
        results: { resources: [], questions: [], users: [] },
      });
    }

    const query = q.trim();
    const results = {};

    if (type === 'all' || type === 'resource') {
      results.resources = await prisma.resource.findMany({
        where: {
          isApproved: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
        take: 10,
        include: {
          contributor: { select: { name: true, batchYear: true } },
        },
      });
    }

    if (type === 'all' || type === 'question') {
      results.questions = await prisma.question.findMany({
        where: {
          isReported: false,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: {
          asker: { select: { name: true, batchYear: true } },
          answers: { select: { id: true } },
        },
      });
    }

    if (type === 'all' || type === 'user') {
      results.users = await prisma.user.findMany({
        where: {
          status: { not: 'SUSPENDED' },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          role: true,
          batchYear: true,
          rollNumber: true,
          headline: true,
        },
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

export default { search };

