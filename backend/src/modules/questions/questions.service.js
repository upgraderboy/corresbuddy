import prisma from '../../config/db.js';
import { recordContribution } from '../contributions/contributions.service.js';

export const listQuestions = async (query = {}) => {
  const { search, subject, batch, answered, page = 1, limit = 50 } = query;

  const take = Math.min(parseInt(limit, 10) || 50, 100);
  const skip = ((parseInt(page, 10) || 1) - 1) * take;

  const where = {
    isReported: false,
    ...(subject && subject !== 'All' && { subject: { equals: subject, mode: 'insensitive' } }),
    ...(answered !== undefined && { isAnswered: answered === 'true' || answered === true }),
    ...(batch && { asker: { batchYear: parseInt(batch, 10) } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, questions] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      include: {
        asker: {
          select: { id: true, name: true, batchYear: true, rollNumber: true },
        },
        answers: {
          select: { id: true, isAccepted: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
  ]);

  const formatted = questions.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    subject: q.subject,
    asker: q.asker.name,
    askerId: q.asker.id,
    batch: q.asker.batchYear,
    answers: q.answers.length,
    accepted: q.answers.some((a) => a.isAccepted),
    createdAt: q.createdAt,
  }));

  return {
    total,
    page: parseInt(page, 10) || 1,
    limit: take,
    totalPages: Math.ceil(total / take),
    questions: formatted,
  };
};

export const getQuestionById = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      asker: {
        select: { id: true, name: true, batchYear: true, rollNumber: true, headline: true },
      },
      answers: {
        include: {
          author: {
            select: { id: true, name: true, batchYear: true, rollNumber: true, headline: true, role: true },
          },
        },
        orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!question) throw new Error('Question not found');

  return {
    id: question.id,
    title: question.title,
    description: question.description,
    body: question.description,
    subject: question.subject,
    asker: question.asker.name,
    askerId: question.asker.id,
    batch: question.asker.batchYear,
    createdAt: question.createdAt,
    answers: question.answers.length,
    accepted: question.answers.some((a) => a.isAccepted),
    answersList: question.answers.map((a) => ({
      id: a.id,
      author: a.author.name,
      authorId: a.author.id,
      batch: a.author.batchYear,
      role: a.author.role,
      content: a.content,
      accepted: a.isAccepted,
      createdAt: a.createdAt,
    })),
  };
};

export const createQuestion = async (data, user) => {
  const { title, description, subject = 'General' } = data;

  const question = await prisma.question.create({
    data: {
      title,
      description,
      subject,
      askerId: user.id,
    },
    include: {
      asker: { select: { id: true, name: true, batchYear: true } },
    },
  });

  // Notify assigned Corres if student has one
  const assignment = await prisma.corresAssignment.findFirst({
    where: { juniorId: user.id, status: 'ACTIVE' },
  });

  if (assignment) {
    await prisma.notification.create({
      data: {
        recipientId: assignment.seniorId,
        type: 'question',
        title: 'New question from your junior',
        message: `${user.name} asked: "${question.title}"`,
        data: JSON.stringify({ questionId: question.id }),
      },
    });
  }

  return question;
};

export const updateQuestion = async (id, data, user) => {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw new Error('Question not found');
  if (q.askerId !== user.id && user.role !== 'ADMIN') throw new Error('Unauthorized');

  const { title, description, subject } = data;
  return await prisma.question.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(subject && { subject }),
    },
  });
};

export const deleteQuestion = async (id, user) => {
  const q = await prisma.question.findUnique({ where: { id } });
  if (!q) throw new Error('Question not found');
  if (q.askerId !== user.id && user.role !== 'ADMIN') throw new Error('Unauthorized');

  return await prisma.question.delete({ where: { id } });
};

export const addAnswer = async (questionId, data, user) => {
  const { content } = data;
  if (!content) throw new Error('Answer content is required');

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { asker: true },
  });

  if (!question) throw new Error('Question not found');

  const answer = await prisma.answer.create({
    data: {
      questionId,
      authorId: user.id,
      content,
    },
    include: {
      author: {
        select: { id: true, name: true, batchYear: true },
      },
    },
  });

  await prisma.question.update({
    where: { id: questionId },
    data: { isAnswered: true },
  });

  // Record contribution
  await recordContribution({
    userId: user.id,
    type: 'ANSWER',
    referenceId: answer.id,
    title: `Answered: ${question.title}`,
    batchYear: user.batchYear || 2025,
  });

  // Notify question asker
  await prisma.notification.create({
    data: {
      recipientId: question.askerId,
      type: 'answer',
      title: 'Your question was answered',
      message: `${user.name} answered "${question.title}"`,
      data: JSON.stringify({ questionId, answerId: answer.id }),
    },
  });

  return answer;
};

export const updateAnswer = async (id, data, user) => {
  const answer = await prisma.answer.findUnique({ where: { id } });
  if (!answer) throw new Error('Answer not found');
  if (answer.authorId !== user.id && user.role !== 'ADMIN') throw new Error('Unauthorized');

  return await prisma.answer.update({
    where: { id },
    data: { content: data.content },
  });
};

export const deleteAnswer = async (id, user) => {
  const answer = await prisma.answer.findUnique({ where: { id } });
  if (!answer) throw new Error('Answer not found');
  if (answer.authorId !== user.id && user.role !== 'ADMIN') throw new Error('Unauthorized');

  return await prisma.answer.delete({ where: { id } });
};

export const acceptAnswer = async (answerId, user) => {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { question: true },
  });

  if (!answer) throw new Error('Answer not found');
  if (answer.question.askerId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Only the question author can accept an answer');
  }

  // Unaccept previous answers for this question
  await prisma.answer.updateMany({
    where: { questionId: answer.questionId },
    data: { isAccepted: false },
  });

  return await prisma.answer.update({
    where: { id: answerId },
    data: { isAccepted: true },
  });
};

export default {
  listQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
};

