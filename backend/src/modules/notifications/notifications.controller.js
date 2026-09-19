import * as notificationsService from './notifications.service.js';

export const listNotifications = async (req, res, next) => {
  try {
    const result = await notificationsService.listNotifications(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await notificationsService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationsService.deleteNotification(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

export const registerDevice = async (req, res, next) => {
  try {
    const { token, deviceType } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Device token required' });
    await notificationsService.registerDevice(req.user.id, token, deviceType);
    res.json({ success: true, message: 'Device registered for notifications' });
  } catch (error) {
    next(error);
  }
};

export default {
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  registerDevice,
};

