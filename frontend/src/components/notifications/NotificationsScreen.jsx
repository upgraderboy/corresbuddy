import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Empty } from '../common/CommonUI';
import { notificationsApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifsCount } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.listNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter((n) => !n.read).length;
        setUnreadNotifsCount(unread);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifsCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <div>
      <PageHead
        title="Notifications"
        subhead="New messages, answers, resources and Corres activity."
        action={
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        }
      />

      <div className="card">
        {notifications.length === 0 ? (
          <Empty
            icon="bell"
            title="All caught up"
            body="No notifications right now."
          />
        ) : (
          notifications.map((n) => (
            <div
              className="notif-item"
              key={n.id}
              style={{ opacity: n.read ? 0.65 : 1, cursor: 'pointer' }}
              onClick={() => handleMarkOneRead(n.id)}
            >
              <div
                className="notif-ic"
                style={{
                  background: `var(--${n.tone}-100)`,
                  color: `var(--${n.tone}-500)`,
                }}
              >
                <Icon name={n.icon} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-600)' }}>{n.body}</div>
              </div>
              <div className="notif-time">{n.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsScreen;

