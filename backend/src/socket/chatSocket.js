import { verifyToken } from '../config/jwt.js';
import * as chatService from '../modules/chat/chat.service.js';
import prisma from '../config/db.js';

export const setupChatSocket = (io) => {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.userId}`);

    // Join personal user room for targeted notifications
    socket.join(`user:${socket.userId}`);

    // 1. join_conversation
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conv:${conversationId}`);
      console.log(`User ${socket.userId} joined conv:${conversationId}`);
    });

    // 2. send_message
    socket.on('send_message', async ({ conversationId, content }) => {
      if (!conversationId || !content?.trim()) return;

      try {
        // Persist message in PostgreSQL
        const message = await chatService.saveMessage(conversationId, socket.userId, content.trim());

        const formattedMessage = {
          id: message.id,
          conversationId,
          senderId: socket.userId,
          content: message.content,
          text: message.content,
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: message.createdAt,
          isRead: false,
          me: false,
        };

        // Confirmation back to sender
        socket.emit('message_sent', { ...formattedMessage, me: true });

        // Broadcast to other participants in this conversation
        socket.to(`conv:${conversationId}`).emit('new_message', formattedMessage);

        // Find recipient to send push/notification if offline
        const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (conv) {
          const recipientId = conv.participant1Id === socket.userId ? conv.participant2Id : conv.participant1Id;
          const sender = await prisma.user.findUnique({ where: { id: socket.userId }, select: { name: true } });

          await prisma.notification.create({
            data: {
              recipientId,
              type: 'message',
              title: `${sender?.name || 'Someone'} sent you a message`,
              message: `"${content.trim().slice(0, 80)}"`,
              data: JSON.stringify({ conversationId }),
            },
          });

          io.to(`user:${recipientId}`).emit('notification', {
            type: 'message',
            title: `${sender?.name || 'Someone'} sent you a message`,
            body: content.trim().slice(0, 80),
          });
        }
      } catch (err) {
        console.error('Error saving message in socket:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // 3. typing_start
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        typing: true,
      });
    });

    // 4. typing_stop
    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        typing: false,
      });
    });

    // 5. message_read
    socket.on('message_read', async ({ conversationId }) => {
      try {
        await chatService.markAsRead(conversationId, socket.userId);
        socket.to(`conv:${conversationId}`).emit('message_read', {
          conversationId,
          readBy: socket.userId,
        });
      } catch (err) {
        console.error('Error marking messages as read in socket:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${socket.userId}`);
    });
  });
};

export default setupChatSocket;

