import prisma from '../../config/db.js';

/**
 * Core Corres Assignment Logic
 * Matches a junior with a senior from immediately previous batch:
 * 1. Same roll number match
 * 2. Fallback to top-performing senior
 */
export const assignCorresForJunior = async (juniorId) => {
  const junior = await prisma.user.findUnique({
    where: { id: juniorId },
    include: {
      assignmentsAsJunior: true,
    },
  });

  if (!junior) {
    throw new Error('Junior student not found');
  }

  if (junior.role !== 'STUDENT') {
    return null; // Only students receive a Corres assignment
  }

  if (!junior.batchYear || junior.rollNumber === null || junior.rollNumber === undefined) {
    return null; // Missing academic profile data
  }

  // Check if active assignment already exists
  const existingAssignment = await prisma.corresAssignment.findFirst({
    where: {
      juniorId: junior.id,
      status: 'ACTIVE',
    },
    include: {
      senior: true,
    },
  });

  if (existingAssignment) {
    return existingAssignment;
  }

  const previousBatchYear = junior.batchYear - 1;

  // 1. Search previous batch for same roll number
  const sameRollSenior = await prisma.user.findFirst({
    where: {
      program: junior.program,
      branch: junior.branch,
      batchYear: previousBatchYear,
      rollNumber: junior.rollNumber,
      role: { in: ['SENIOR', 'ALUMNI'] },
      status: { not: 'SUSPENDED' },
    },
  });

  let assignedSenior = sameRollSenior;
  let assignmentType = 'SAME_ROLL';
  let reason = `Same roll number found in batch ${previousBatchYear}`;

  // 2. If not found, search for an eligible top-performing senior
  if (!assignedSenior) {
    // Look for top performers in the previous batch
    const topPerformers = await prisma.user.findMany({
      where: {
        program: junior.program,
        branch: junior.branch,
        batchYear: previousBatchYear,
        role: { in: ['SENIOR', 'ALUMNI'] },
        status: { not: 'SUSPENDED' },
        isTopPerformer: true,
      },
      include: {
        assignmentsAsSenior: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (topPerformers.length > 0) {
      // Pick top performer with fewest assigned juniors
      topPerformers.sort((a, b) => a.assignmentsAsSenior.length - b.assignmentsAsSenior.length);
      assignedSenior = topPerformers[0];
      assignmentType = 'FALLBACK_TOP_PERFORMER';
      reason = `No senior with roll number ${junior.rollNumber} found in batch ${previousBatchYear}. Assigned top-performing senior.`;
    } else {
      // If no designated top performer, pick any eligible senior in previous batch with lowest load
      const generalSeniors = await prisma.user.findMany({
        where: {
          program: junior.program,
          branch: junior.branch,
          batchYear: previousBatchYear,
          role: { in: ['SENIOR', 'ALUMNI'] },
          status: { not: 'SUSPENDED' },
        },
        include: {
          assignmentsAsSenior: {
            where: { status: 'ACTIVE' },
          },
        },
      });

      if (generalSeniors.length > 0) {
        generalSeniors.sort((a, b) => a.assignmentsAsSenior.length - b.assignmentsAsSenior.length);
        assignedSenior = generalSeniors[0];
        assignmentType = 'FALLBACK_TOP_PERFORMER';
        reason = `Assigned senior from batch ${previousBatchYear} as fallback.`;
      }
    }
  }

  if (!assignedSenior) {
    return null; // No previous batch seniors available
  }

  // Create Corres assignment
  const assignment = await prisma.corresAssignment.create({
    data: {
      juniorId: junior.id,
      seniorId: assignedSenior.id,
      juniorBatchYear: junior.batchYear,
      seniorBatchYear: assignedSenior.batchYear || previousBatchYear,
      type: assignmentType,
      reason,
      status: 'ACTIVE',
    },
    include: {
      senior: true,
      junior: true,
    },
  });

  // Create in-app notifications
  await prisma.notification.create({
    data: {
      recipientId: junior.id,
      type: 'corres_assigned',
      title: 'Corres assigned',
      message: `You were matched with ${assignedSenior.name} (Batch ${assignedSenior.batchYear}, Roll ${assignedSenior.rollNumber || '—'}) — ${assignmentType === 'SAME_ROLL' ? 'same roll number' : 'top performer fallback'}.`,
      data: JSON.stringify({ assignmentId: assignment.id, seniorId: assignedSenior.id }),
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: assignedSenior.id,
      type: 'junior_assigned',
      title: 'New junior assigned',
      message: `${junior.name} (Batch ${junior.batchYear}, Roll ${junior.rollNumber}) has been assigned to you as your junior.`,
      data: JSON.stringify({ assignmentId: assignment.id, juniorId: junior.id }),
    },
  });

  // Update Generational History record
  await syncGenerationalLineage(junior.rollNumber, junior.program, junior.branch, junior.college);

  return assignment;
};

/**
 * Run bulk assignment for an entire batch
 */
export const assignBatchCorres = async (batchYear, program = 'MCA', branch = 'Computer Applications') => {
  const juniors = await prisma.user.findMany({
    where: {
      batchYear: parseInt(batchYear, 10),
      program,
      branch,
      role: 'STUDENT',
      status: { not: 'SUSPENDED' },
    },
  });

  const results = {
    totalJuniors: juniors.length,
    assignedCount: 0,
    sameRollCount: 0,
    fallbackCount: 0,
    assignments: [],
  };

  for (const junior of juniors) {
    const assignment = await assignCorresForJunior(junior.id);
    if (assignment) {
      results.assignedCount += 1;
      if (assignment.type === 'SAME_ROLL') {
        results.sameRollCount += 1;
      } else {
        results.fallbackCount += 1;
      }
      results.assignments.push(assignment);
    }
  }

  return results;
};

/**
 * Synchronize the multi-generational lineage chain for a roll number
 */
export const syncGenerationalLineage = async (rollNumber, program, branch, college = 'VIT Vellore') => {
  if (rollNumber === null || rollNumber === undefined) return;

  // Find all students/seniors/alumni with this roll number ordered descending by batch
  const students = await prisma.user.findMany({
    where: {
      rollNumber,
      program,
      branch,
      college,
    },
    orderBy: {
      batchYear: 'desc',
    },
    include: {
      resources: true,
      contributions: true,
    },
  });

  const chain = students.map((s, index) => ({
    userId: s.id,
    name: s.name,
    batch: s.batchYear,
    roll: s.rollNumber,
    role: s.role,
    isCorres: index === 1,
    resourcesCount: s.resources.length,
    contributionsCount: s.contributions.length,
  }));

  const existing = await prisma.generationalHistory.findFirst({
    where: { rollNumber, program, branch },
  });

  const serializedChain = typeof chain === 'string' ? chain : JSON.stringify(chain);

  if (existing) {
    await prisma.generationalHistory.update({
      where: { id: existing.id },
      data: { chain: serializedChain },
    });
  } else {
    await prisma.generationalHistory.create({
      data: {
        rollNumber,
        program,
        branch,
        college,
        chain: serializedChain,
      },
    });
  }
};

export default {
  assignCorresForJunior,
  assignBatchCorres,
  syncGenerationalLineage,
};

