import prisma from '../../config/db.js';

export const listConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  const formatted = await Promise.all(
    conversations.map(async (conv) => {
      const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      const other = await prisma.user.findUnique({
        where: { id: otherId },
        select: {
          id: true,
          name: true,
          batchYear: true,
          rollNumber: true,
          role: true,
          profilePhoto: true,
        },
      });

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: otherId,
          isRead: false,
        },
      });

      const lastMsg = conv.messages[0];

      return {
        id: conv.id,
        participantId: other?.id,
        name: other?.name || 'User',
        initials: (other?.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
        role: other?.role === 'SENIOR' ? 'Your Corres' : `Batch ${other?.batchYear || ''}`,
        last: lastMsg?.content || 'No messages yet',
        lastSenderId: lastMsg?.senderId,
        time: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread: unreadCount,
        online: true,
      };
    })
  );

  return formatted;
};

export const getConversationById = async (id, userId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) throw new Error('Conversation not found');
  if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  const otherId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { id: true, name: true, batchYear: true, rollNumber: true, role: true, headline: true },
  });

  return {
    ...conversation,
    otherUser: other,
  };
};

export const getMessages = async (conversationId, userId, query = {}) => {
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) throw new Error('Conversation not found');
  if (conv.participant1Id !== userId && conv.participant2Id !== userId) {
    throw new Error('Unauthorized');
  }

  const { limit = 100 } = query;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: parseInt(limit, 10),
  });

  return messages.map((m) => ({
    id: m.id,
    me: m.senderId === userId,
    senderId: m.senderId,
    text: m.content,
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: m.createdAt,
    isRead: m.isRead,
  }));
};

export const openOrCreateConversation = async (userId, participantId) => {
  if (userId === participantId) throw new Error('Cannot start conversation with yourself');

  // Order participant IDs consistently
  const [p1, p2] = [userId, participantId].sort();

  let conversation = await prisma.conversation.findUnique({
    where: {
      participant1Id_participant2Id: {
        participant1Id: p1,
        participant2Id: p2,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: p1,
        participant2Id: p2,
      },
    });
  }

  return conversation;
};

export const markAsRead = async (conversationId, userId) => {
  return await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const saveMessage = async (conversationId, senderId, content) => {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  return message;
};

export default {
  listConversations,
  getConversationById,
  getMessages,
  openOrCreateConversation,
  markAsRead,
  saveMessage,
};

