import prisma from '../../config/db.js';

export const listNotifications = async (userId, query = {}) => {
  const { read, page = 1, limit = 50 } = query;

  const take = Math.min(parseInt(limit, 10) || 50, 100);
  const skip = ((parseInt(page, 10) || 1) - 1) * take;

  const where = {
    recipientId: userId,
    ...(read !== undefined && { isRead: read === 'true' || read === true }),
  };

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
  ]);

  const formatted = notifications.map((n) => {
    let tone = 'slate';
    let icon = 'bell';

    if (n.type === 'message') {
      tone = 'brass';
      icon = 'message';
    } else if (n.type === 'answer') {
      tone = 'sage';
      icon = 'check';
    } else if (n.type === 'resource') {
      tone = 'slate';
      icon = 'book';
    } else if (n.type === 'corres_assigned' || n.type === 'junior_assigned') {
      tone = 'brass';
      icon = 'branch';
    }

    return {
      id: n.id,
      icon,
      tone,
      title: n.title,
      body: n.message,
      read: n.isRead,
      time: formatRelativeTime(n.createdAt),
      createdAt: n.createdAt,
      data: n.data,
    };
  });

  return {
    total,
    page: parseInt(page, 10) || 1,
    limit: take,
    totalPages: Math.ceil(total / take),
    notifications: formatted,
  };
};

export const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, recipientId: userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
};

export const deleteNotification = async (id, userId) => {
  return await prisma.notification.deleteMany({
    where: { id, recipientId: userId },
  });
};

export const registerDevice = async (userId, token, deviceType = 'WEB') => {
  return await prisma.deviceToken.upsert({
    where: { token },
    update: { userId, deviceType },
    create: { userId, token, deviceType },
  });
};

function formatRelativeTime(date) {
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerDevice,
};

