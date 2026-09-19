import express from 'express';
import * as notificationsController from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, notificationsController.listNotifications);
router.patch('/read-all', authenticate, notificationsController.markAllRead);
router.patch('/:id/read', authenticate, notificationsController.markRead);
router.delete('/:id', authenticate, notificationsController.deleteNotification);
router.post('/register-device', authenticate, notificationsController.registerDevice);

export default router;

