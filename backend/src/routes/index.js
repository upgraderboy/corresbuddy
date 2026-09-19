import express from 'express';
import prisma from '../config/db.js';

import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import batchesRoutes from '../modules/batches/batches.routes.js';
import corresRoutes from '../modules/corres/corres.routes.js';
import lineageRoutes from '../modules/lineage/lineage.routes.js';
import resourcesRoutes from '../modules/resources/resources.routes.js';
import questionsRoutes from '../modules/questions/questions.routes.js';
import chatRoutes from '../modules/chat/chat.routes.js';
import contributionsRoutes from '../modules/contributions/contributions.routes.js';
import streakRoutes from '../modules/streak/streak.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import searchRoutes from '../modules/search/search.routes.js';

const router = express.Router();

// Health endpoints
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CorresBuddy Backend API',
  });
});

router.get('/health/database', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Module routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/batches', batchesRoutes);
router.use('/corres', corresRoutes);
router.use('/lineage', lineageRoutes);
router.use('/resources', resourcesRoutes);
router.use('/questions', questionsRoutes);
router.use('/conversations', chatRoutes);
router.use('/contributions', contributionsRoutes);
router.use('/streak', streakRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);

export default router;

