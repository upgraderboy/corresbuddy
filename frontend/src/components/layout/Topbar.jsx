import React, { useState } from 'react';
import Icon from '../common/Icon';
import { useSocket } from '../../context/SocketContext';
import StreakCalendarModal from '../common/StreakCalendarModal';

const TITLES = {
  dashboard: 'Dashboard',
  corres: 'My Corres',
  resources: 'Resource Directory',
  resourceDetail: 'Resource',
  upload: 'Upload Resource',
  qa: 'Q&A',
  question: 'Question',
  chat: 'Chat',
  lineage: 'Generational History',
  saved: 'Saved Resources',
  notifications: 'Notifications',
  profile: 'Profile',
  juniors: 'My Juniors',
  contributions: 'Contributions',
  users: 'User Management',
  batches: 'Batch Configuration',
  assignments: 'Corres Assignment Engine',
  moderation: 'Moderation & Reports',
};

export function Topbar({ screen, nav, user, onLogout, setMobileOpen, onSearch }) {
  const [query, setQuery] = useState('');
  const [showStreakModal, setShowStreakModal] = useState(false);
  const { unreadNotifsCount } = useSocket();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  const streakCount = user?.streak?.currentStreak ?? user?.streakCount ?? 0;
  const longestStreak = user?.streak?.longestStreak ?? user?.longestStreak ?? streakCount;
  const totalContributions = user?.totalContributions ?? (user?.streak?.thisMonthCount || 0);

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="icon-btn menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
          <h1 className="topbar-title" style={{ margin: 0 }}>
            {TITLES[screen] || 'Dashboard'}
          </h1>
        </div>

        <div className="topbar-right">
          <div className="search-bar" style={{ width: 220 }}>
            <Icon name="search" />
            <input
              placeholder="Search CorresBuddy..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search"
            />
          </div>

          {/* Streak Flame Badge */}
          <button
            type="button"
            className="streak-badge-btn"
            onClick={() => setShowStreakModal(true)}
            title="View contribution streak & activity calendar"
            aria-label={`Contribution streak: ${streakCount} days`}
          >
            <span>🔥</span>
            <span>{streakCount}</span>
          </button>

          {/* Notifications Button */}
          <button
            className="icon-btn"
            onClick={() => nav('notifications')}
            aria-label="Notifications"
          >
            <Icon name="bell" />
            {unreadNotifsCount > 0 && <span className="dot" />}
          </button>

          {/* Logout Button */}
          <button className="icon-btn" onClick={onLogout} aria-label="Log out" title="Log out">
            <Icon name="logout" />
          </button>
        </div>
      </header>

      {/* Contribution Calendar Modal */}
      <StreakCalendarModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakCount={streakCount}
        longestStreak={longestStreak}
        totalContributions={totalContributions}
      />
    </>
  );
}

export default Topbar;
