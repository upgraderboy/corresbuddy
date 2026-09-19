import prisma from '../../config/db.js';

export const listUsers = async (query = {}) => {
  const { role, batch, program, branch, status, search } = query;

  return await prisma.user.findMany({
    where: {
      ...(role && { role }),
      ...(status && { status }),
      ...(batch && { batchYear: parseInt(batch, 10) }),
      ...(program && { program }),
      ...(branch && { branch }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      batchYear: true,
      rollNumber: true,
      status: true,
      isTopPerformer: true,
      createdAt: true,
    },
    orderBy: [{ batchYear: 'desc' }, { rollNumber: 'asc' }],
  });
};

export const updateUserStatus = async (id, status) => {
  return await prisma.user.update({
    where: { id },
    data: { status },
  });
};

export const verifyUser = async (id) => {
  return await prisma.user.update({
    where: { id },
    data: { status: 'ACTIVE' },
  });
};

export const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const getReportedResources = async () => {
  return await prisma.resource.findMany({
    where: { isReported: true },
    include: {
      contributor: { select: { id: true, name: true, batchYear: true } },
    },
  });
};

export const getReportedQuestions = async () => {
  return await prisma.question.findMany({
    where: { isReported: true },
    include: {
      asker: { select: { id: true, name: true } },
    },
  });
};

export const getReportedChat = async () => {
  return await prisma.moderationReport.findMany({
    where: { type: 'Chat message', status: 'PENDING' },
  });
};

export const moderateResource = async (id, action) => {
  // action: 'approve' | 'reject' | 'remove'
  if (action === 'remove' || action === 'reject') {
    return await prisma.resource.delete({ where: { id } });
  }
  return await prisma.resource.update({
    where: { id },
    data: { isApproved: true, isReported: false },
  });
};

export const moderateQuestion = async (id, action) => {
  if (action === 'remove' || action === 'reject') {
    return await prisma.question.delete({ where: { id } });
  }
  return await prisma.question.update({
    where: { id },
    data: { isReported: false },
  });
};

export const moderateAnswer = async (id, action) => {
  if (action === 'remove' || action === 'reject') {
    return await prisma.answer.delete({ where: { id } });
  }
  return await prisma.answer.update({
    where: { id },
    data: { isReported: false },
  });
};

export default {
  listUsers,
  updateUserStatus,
  verifyUser,
  deleteUser,
  getReportedResources,
  getReportedQuestions,
  getReportedChat,
  moderateResource,
  moderateQuestion,
  moderateAnswer,
};

