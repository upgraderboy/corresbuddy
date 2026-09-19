import express from 'express';
import * as questionsController from './questions.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, questionsController.listQuestions);
router.get('/:id', authenticate, questionsController.getQuestion);
router.post('/', authenticate, questionsController.createQuestion);
router.patch('/:id', authenticate, questionsController.updateQuestion);
router.delete('/:id', authenticate, questionsController.deleteQuestion);

// Answers
router.post('/:id/answers', authenticate, questionsController.addAnswer);
router.patch('/answers/:id', authenticate, questionsController.updateAnswer);
router.delete('/answers/:id', authenticate, questionsController.deleteAnswer);
router.post('/answers/:id/accept', authenticate, questionsController.acceptAnswer);

export default router;

