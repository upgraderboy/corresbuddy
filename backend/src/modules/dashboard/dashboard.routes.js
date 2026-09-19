import express from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

router.get('/student', authenticate, dashboardController.getStudentDashboard);
router.get('/senior', authenticate, dashboardController.getSeniorDashboard);
router.get('/admin', authenticate, authorizeRoles('ADMIN'), dashboardController.getAdminDashboard);

export default router;

