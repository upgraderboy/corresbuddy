import React from 'react';
import Icon from '../common/Icon';
import { Avatar } from '../common/CommonUI';

const NAV_CONFIG = {
  student: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'corres', label: 'My Corres', icon: 'users' },
    { key: 'resources', label: 'Resources', icon: 'book' },
    { key: 'qa', label: 'Q&A', icon: 'help' },
    { key: 'chat', label: 'Chat', icon: 'message' },
    { key: 'lineage', label: 'Generational History', icon: 'layers' },
    { key: 'saved', label: 'Saved Resources', icon: 'bookmark' },
    { key: 'notifications', label: 'Notifications', icon: 'bell' },
    { key: 'profile', label: 'Profile', icon: 'user' },
  ],
  senior: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'juniors', label: 'My Juniors', icon: 'users' },
    { key: 'resources', label: 'Resources', icon: 'book' },
    { key: 'qa', label: 'Q&A', icon: 'help' },
    { key: 'chat', label: 'Chat', icon: 'message' },
    { key: 'contributions', label: 'Contributions', icon: 'flame' },
    { key: 'notifications', label: 'Notifications', icon: 'bell' },
    { key: 'profile', label: 'Profile', icon: 'user' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'users', label: 'Users', icon: 'users' },
    { key: 'batches', label: 'Batches', icon: 'layers' },
    { key: 'assignments', label: 'Corres Assignments', icon: 'branch' },
    { key: 'resources', label: 'Resources', icon: 'book' },
    { key: 'moderation', label: 'Moderation', icon: 'shield' },
  ],
};

export function Sidebar({
  role,
  screen,
  setScreen,
  setRole,
  user,
  mobileOpen,
  setMobileOpen,
}) {
  const currentNav = NAV_CONFIG[role] || NAV_CONFIG.student;

  const initials = user?.name
    ? user.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
    : role === 'admin'
    ? 'AD'
    : role === 'senior'
    ? 'PM'
    : 'AK';

  const displayName = user?.name || (role === 'admin' ? 'Admin User' : role === 'senior' ? 'Priya Menon' : 'Ak');
  const displayMeta =
    role === 'admin'
      ? 'Administrator'
      : role === 'senior'
      ? `Senior · Batch ${user?.batchYear || 2025}`
      : `Student · Batch ${user?.batchYear || 2026}`;

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">C</div>
        <div>
          <div className="brand-name">Corres</div>
          <div className="brand-sub">Knowledge across generations</div>
        </div>
      </div>

      <div className="nav-list">
        {currentNav.map((it) => (
          <button
            key={it.key}
            className={`nav-item ${screen === it.key ? 'active' : ''}`}
            onClick={() => {
              setScreen(it.key);
              setMobileOpen(false);
            }}
          >
            <Icon name={it.icon} className="nav-ic" />
            {it.label}
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="role-preview">
          <div className="role-preview-label">Previewing as</div>
          <div className="role-seg">
            {['student', 'senior', 'admin'].map((r) => (
              <button
                key={r}
                className={role === r ? 'active' : ''}
                onClick={() => {
                  setRole(r);
                  setScreen('dashboard');
                }}
              >
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="user-chip">
          <Avatar initials={initials} size={36} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div className="user-chip-name truncate">{displayName}</div>
            <div className="user-chip-meta truncate">{displayMeta}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

