import prisma from '../../config/db.js';

export const listBatches = async (filters = {}) => {
  const { program, branch, year, college } = filters;
  return await prisma.batch.findMany({
    where: {
      ...(program && { program }),
      ...(branch && { branch }),
      ...(year && { year: parseInt(year, 10) }),
      ...(college && { college }),
    },
    orderBy: { year: 'desc' },
  });
};

export const getBatchById = async (id) => {
  const batch = await prisma.batch.findUnique({
    where: { id },
  });
  if (!batch) throw new Error('Batch not found');
  return batch;
};

export const createBatch = async (data) => {
  const { year, program, branch, college = 'VIT Vellore', status = 'ACTIVE' } = data;
  return await prisma.batch.create({
    data: {
      year: parseInt(year, 10),
      program,
      branch,
      college,
      status,
    },
  });
};

export const updateBatch = async (id, data) => {
  const { year, program, branch, college, status } = data;
  return await prisma.batch.update({
    where: { id },
    data: {
      ...(year && { year: parseInt(year, 10) }),
      ...(program && { program }),
      ...(branch && { branch }),
      ...(college && { college }),
      ...(status && { status }),
    },
  });
};

export const deleteBatch = async (id) => {
  return await prisma.batch.delete({
    where: { id },
  });
};

export const getBatchStudents = async (id) => {
  const batch = await getBatchById(id);
  return await prisma.user.findMany({
    where: {
      batchYear: batch.year,
      program: batch.program,
      branch: batch.branch,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      rollNumber: true,
      status: true,
      isTopPerformer: true,
    },
    orderBy: { rollNumber: 'asc' },
  });
};

export default {
  listBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStudents,
};

