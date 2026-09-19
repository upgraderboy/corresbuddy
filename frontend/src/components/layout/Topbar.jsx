import React, { useState } from 'react';
import Icon from '../common/Icon';
import { useSocket } from '../../context/SocketContext';

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
  users: 'Users',
  batches: 'Batches',
  assignments: 'Corres Assignment Management',
  moderation: 'Moderation',
};

export function Topbar({ screen, nav, onLogout, setMobileOpen, onSearch }) {
  const [query, setQuery] = useState('');
  const { unreadNotifsCount } = useSocket();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="icon-btn menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Icon name="menu" />
        </button>
        <div className="topbar-title">{TITLES[screen] || 'Dashboard'}</div>
      </div>

      <div className="topbar-right">
        <div className="search-bar" style={{ width: 220 }}>
          <Icon name="search" />
          <input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="icon-btn"
          onClick={() => nav('notifications')}
          aria-label="Notifications"
        >
          <Icon name="bell" />
          {unreadNotifsCount > 0 && <span className="dot" />}
        </button>

        <button className="icon-btn" onClick={onLogout} aria-label="Log out">
          <Icon name="logout" />
        </button>
      </div>
    </div>
  );
}

export default Topbar;

