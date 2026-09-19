import express from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticate, usersController.getUser);
router.patch('/:id', authenticate, usersController.updateProfile);
router.get('/:id/academic', authenticate, usersController.getAcademic);
router.patch('/:id/academic', authenticate, usersController.updateAcademic);
router.get('/:id/contributions', authenticate, usersController.getContributions);
router.get('/:id/streak', authenticate, usersController.getStreak);

export default router;

