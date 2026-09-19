import express from 'express';
import * as corresController from './corres.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

router.post('/assign', authenticate, corresController.runAssignment);
router.post('/assign/:batchId', authenticate, corresController.runBatchAssignment);
router.get('/my', authenticate, corresController.getMyCorres);
router.get('/my-juniors', authenticate, authorizeRoles('SENIOR', 'ALUMNI', 'ADMIN'), corresController.getMyJuniors);
router.get('/assignments', authenticate, corresController.listAssignments);
router.get('/:id', authenticate, corresController.getAssignmentById);
router.patch('/:id', authenticate, authorizeRoles('ADMIN'), corresController.updateAssignment);

export default router;

