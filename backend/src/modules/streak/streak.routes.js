import express from 'express';
import * as streakController from './streak.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, streakController.getMyStreak);
router.get('/:userId', authenticate, streakController.getUserStreak);
router.post('/update', authenticate, streakController.updateStreak);

export default router;

