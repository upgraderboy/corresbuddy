import express from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorizeRoles } from '../../middleware/role.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.updateStatus);
router.patch('/users/:id/verify', adminController.verifyUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/resources/reported', adminController.getReportedResources);
router.get('/questions/reported', adminController.getReportedQuestions);
router.get('/chat/reported', adminController.getReportedChat);

router.patch('/resources/:id/moderate', adminController.moderateResource);
router.patch('/questions/:id/moderate', adminController.moderateQuestion);
router.patch('/answers/:id/moderate', adminController.moderateAnswer);

export default router;

