import * as questionsService from './questions.service.js';

export const listQuestions = async (req, res, next) => {
  try {
    const result = await questionsService.listQuestions(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getQuestion = async (req, res, next) => {
  try {
    const question = await questionsService.getQuestionById(req.params.id);
    res.json({ success: true, question });
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const question = await questionsService.createQuestion(req.body, req.user);
    res.status(201).json({ success: true, message: 'Question posted', question });
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await questionsService.updateQuestion(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'Question updated', question });
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    await questionsService.deleteQuestion(req.params.id, req.user);
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};

export const addAnswer = async (req, res, next) => {
  try {
    const answer = await questionsService.addAnswer(req.params.id, req.body, req.user);
    res.status(201).json({ success: true, message: 'Answer posted', answer });
  } catch (error) {
    next(error);
  }
};

export const updateAnswer = async (req, res, next) => {
  try {
    const answer = await questionsService.updateAnswer(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'Answer updated', answer });
  } catch (error) {
    next(error);
  }
};

export const deleteAnswer = async (req, res, next) => {
  try {
    await questionsService.deleteAnswer(req.params.id, req.user);
    res.json({ success: true, message: 'Answer deleted' });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (req, res, next) => {
  try {
    const answer = await questionsService.acceptAnswer(req.params.id, req.user);
    res.json({ success: true, message: 'Answer accepted', answer });
  } catch (error) {
    next(error);
  }
};

export default {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
};

