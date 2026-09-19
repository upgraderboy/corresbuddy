import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import app from './app.js';
import setupChatSocket from './socket/chatSocket.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupChatSocket(io);

// Scheduled tasks via node-cron
// 1. Daily midnight streak verification and gentle contribution reminders
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Running daily contribution and streak checks...');
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Find seniors who contributed 5+ days ago and send a gentle reminder
    const inactiveSeniors = await prisma.user.findMany({
      where: {
        role: { in: ['SENIOR', 'ALUMNI'] },
        status: 'ACTIVE',
        streak: {
          lastContributionDate: { lt: yesterday },
        },
      },
      take: 20,
    });

    for (const senior of inactiveSeniors) {
      await prisma.notification.create({
        data: {
          recipientId: senior.id,
          type: 'reminder',
          title: 'Pass on your experience',
          message: 'Have a useful resource or tip to pass to the next batch?',
        },
      });
    }
  } catch (err) {
    console.error('[Cron] Error in scheduled task:', err.message);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CorresBuddy Backend running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`📡 Socket.IO initialized for real-time Corres chat`);
  console.log(`====================================================`);
});

