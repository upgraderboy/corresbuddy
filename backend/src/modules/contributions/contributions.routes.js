import express from 'express';
import * as contributionsController from './contributions.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

router.post('/', authenticate, contributionsController.createContribution);
router.get('/me', authenticate, contributionsController.getMyContributions);
router.get('/', authenticate, authorizeRoles('ADMIN'), contributionsController.listContributions);

export default router;

