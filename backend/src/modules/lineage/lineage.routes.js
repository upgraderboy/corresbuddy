import express from 'express';
import * as lineageController from './lineage.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, lineageController.getMyLineage);
router.get('/:userId', authenticate, lineageController.getUserLineage);
router.get('/:userId/resources', authenticate, lineageController.getLineageResources);
router.get('/:userId/contributions', authenticate, lineageController.getLineageContributions);
router.get('/:userId/overview', authenticate, lineageController.getLineageOverview);

export default router;

