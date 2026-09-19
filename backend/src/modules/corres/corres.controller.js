import * as corresService from './corres.service.js';
import prisma from '../../config/db.js';

export const runAssignment = async (req, res, next) => {
  try {
    const { juniorId, batchYear, program, branch } = req.body;

    if (juniorId) {
      const assignment = await corresService.assignCorresForJunior(juniorId);
      return res.json({ success: true, message: 'Corres assigned', assignment });
    }

    if (batchYear) {
      const results = await corresService.assignBatchCorres(batchYear, program, branch);
      return res.json({ success: true, message: 'Batch Corres assignment complete', results });
    }

    // Default to authenticated user
    const assignment = await corresService.assignCorresForJunior(req.user.id);
    res.json({ success: true, message: 'Corres assigned', assignment });
  } catch (error) {
    next(error);
  }
};

export const runBatchAssignment = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    // batchId can be batch year or UUID
    let batchYear = parseInt(batchId, 10);
    let program = 'MCA';
    let branch = 'Computer Applications';

    if (isNaN(batchYear)) {
      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (batch) {
        batchYear = batch.year;
        program = batch.program;
        branch = batch.branch;
      }
    }

    const results = await corresService.assignBatchCorres(batchYear, program, branch);
    res.json({ success: true, message: 'Batch assignment completed successfully', results });
  } catch (error) {
    next(error);
  }
};

export const getMyCorres = async (req, res, next) => {
  try {
    const assignment = await prisma.corresAssignment.findFirst({
      where: {
        juniorId: req.user.id,
        status: 'ACTIVE',
      },
      include: {
        senior: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            batchYear: true,
            rollNumber: true,
            headline: true,
            bio: true,
            profilePhoto: true,
            college: true,
            program: true,
            branch: true,
            streak: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.json({
        success: true,
        corres: null,
        message: 'No Corres assigned yet. Assignments will be processed once previous batch data is loaded.',
      });
    }

    res.json({
      success: true,
      corres: {
        id: assignment.senior.id,
        name: assignment.senior.name,
        initials: assignment.senior.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
        batch: assignment.senior.batchYear,
        roll: assignment.senior.rollNumber,
        headline: assignment.senior.headline || 'Senior Mentor',
        bio: assignment.senior.bio,
        online: true,
        streak: assignment.senior.streak,
      },
      assignmentType: assignment.type,
      reason: assignment.reason,
      assignedAt: assignment.assignedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyJuniors = async (req, res, next) => {
  try {
    const assignments = await prisma.corresAssignment.findMany({
      where: {
        seniorId: req.user.id,
        status: 'ACTIVE',
      },
      include: {
        junior: {
          select: {
            id: true,
            name: true,
            email: true,
            batchYear: true,
            rollNumber: true,
            bio: true,
            profilePhoto: true,
            _count: {
              select: { questions: true },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const juniors = assignments.map((a) => ({
      id: a.junior.id,
      name: a.junior.name,
      initials: a.junior.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
      batch: a.junior.batchYear,
      roll: a.junior.rollNumber,
      type: a.type,
      reason: a.reason,
      assignedAt: a.assignedAt,
      questions: a.junior._count.questions,
      lastActive: 'Active today',
    }));

    res.json({ success: true, juniors });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await prisma.corresAssignment.findUnique({
      where: { id: req.params.id },
      include: { junior: true, senior: true },
    });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

export const listAssignments = async (req, res, next) => {
  try {
    const { batch, rollNumber, assignmentType, seniorId, juniorId } = req.query;

    const assignments = await prisma.corresAssignment.findMany({
      where: {
        ...(batch && { juniorBatchYear: parseInt(batch, 10) }),
        ...(assignmentType && { type: assignmentType }),
        ...(seniorId && { seniorId }),
        ...(juniorId && { juniorId }),
        ...(rollNumber && {
          junior: { rollNumber: parseInt(rollNumber, 10) },
        }),
      },
      include: {
        junior: {
          select: { id: true, name: true, rollNumber: true, batchYear: true },
        },
        senior: {
          select: { id: true, name: true, rollNumber: true, batchYear: true, isTopPerformer: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    res.json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const { seniorId, type, reason, status } = req.body;
    const updated = await prisma.corresAssignment.update({
      where: { id: req.params.id },
      data: {
        ...(seniorId && { seniorId }),
        ...(type && { type }),
        ...(reason && { reason }),
        ...(status && { status }),
      },
      include: { junior: true, senior: true },
    });
    res.json({ success: true, message: 'Assignment updated', assignment: updated });
  } catch (error) {
    next(error);
  }
};

export default {
  runAssignment,
  runBatchAssignment,
  getMyCorres,
  getMyJuniors,
  getAssignmentById,
  listAssignments,
  updateAssignment,
};

