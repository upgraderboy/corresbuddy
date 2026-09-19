import React from 'react';
import Icon from '../common/Icon';

const MOBILE_NAV_CONFIG = {
  student: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'corres', label: 'Corres', icon: 'users' },
    { key: 'resources', label: 'Resources', icon: 'book' },
    { key: 'qa', label: 'Q&A', icon: 'help' },
    { key: 'chat', label: 'Chat', icon: 'message' },
  ],
  senior: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'juniors', label: 'Juniors', icon: 'users' },
    { key: 'resources', label: 'Resources', icon: 'book' },
    { key: 'qa', label: 'Q&A', icon: 'help' },
    { key: 'chat', label: 'Chat', icon: 'message' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'batches', label: 'Batches', icon: 'layers' },
    { key: 'assignments', label: 'Assign', icon: 'branch' },
    { key: 'moderation', label: 'Moderate', icon: 'shield' },
  ],
};

export function MobileNav({ role, screen, nav }) {
  const items = MOBILE_NAV_CONFIG[role] || MOBILE_NAV_CONFIG.student;

  return (
    <div className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.key}
          className={screen === it.key ? 'active' : ''}
          onClick={() => nav(it.key)}
        >
          <Icon name={it.icon} className="nav-ic" />
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

export default MobileNav;

