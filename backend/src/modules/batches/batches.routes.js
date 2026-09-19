import express from 'express';
import * as batchesController from './batches.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

router.get('/', authenticate, batchesController.listBatches);
router.get('/:id', authenticate, batchesController.getBatch);
router.post('/', authenticate, authorizeRoles('ADMIN'), batchesController.createBatch);
router.patch('/:id', authenticate, authorizeRoles('ADMIN'), batchesController.updateBatch);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), batchesController.deleteBatch);
router.get('/:id/students', authenticate, batchesController.getBatchStudents);

export default router;

