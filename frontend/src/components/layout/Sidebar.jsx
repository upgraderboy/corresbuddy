import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import { Avatar } from '../common/CommonUI';

const NAV_CONFIG = {
  student: [
    { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'corres', path: '/corres', label: 'My Corres', icon: 'users' },
    { key: 'resources', path: '/resources', label: 'Resources', icon: 'book' },
    { key: 'qa', path: '/qa', label: 'Q&A', icon: 'help' },
    { key: 'chat', path: '/chat', label: 'Chat', icon: 'message' },
    { key: 'lineage', path: '/lineage', label: 'Generational History', icon: 'layers' },
    { key: 'saved', path: '/saved', label: 'Saved Resources', icon: 'bookmark' },
    { key: 'notifications', path: '/notifications', label: 'Notifications', icon: 'bell' },
    { key: 'profile', path: '/profile', label: 'Profile', icon: 'user' },
  ],
  senior: [
    { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'juniors', path: '/juniors', label: 'My Juniors', icon: 'users' },
    { key: 'resources', path: '/resources', label: 'Resources', icon: 'book' },
    { key: 'qa', path: '/qa', label: 'Q&A', icon: 'help' },
    { key: 'chat', path: '/chat', label: 'Chat', icon: 'message' },
    { key: 'contributions', path: '/contributions', label: 'Contributions', icon: 'flame' },
    { key: 'notifications', path: '/notifications', label: 'Notifications', icon: 'bell' },
    { key: 'profile', path: '/profile', label: 'Profile', icon: 'user' },
  ],
  admin: [
    { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { key: 'users', path: '/admin/users', label: 'Users', icon: 'users' },
    { key: 'batches', path: '/admin/batches', label: 'Batches', icon: 'layers' },
    { key: 'assignments', path: '/admin/assignments', label: 'Corres Assignments', icon: 'branch' },
    { key: 'resources', path: '/resources', label: 'Resources', icon: 'book' },
    { key: 'moderation', path: '/admin/moderation', label: 'Moderation', icon: 'shield' },
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
  const navigate = useNavigate();
  const currentNav = NAV_CONFIG[role] || NAV_CONFIG.student;
  const isDev = Boolean(import.meta.env?.DEV || process.env.NODE_ENV === 'development');

  const initials = user?.name
    ? user.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
    : role === 'admin'
    ? 'AD'
    : role === 'senior'
    ? 'PM'
    : 'AK';

  const displayName = user?.name || (role === 'admin' ? 'Admin User' : role === 'senior' ? 'Priya Menon' : 'Student');
  const displayMeta =
    role === 'admin'
      ? 'Administrator'
      : role === 'senior'
      ? `Senior · Batch ${user?.batchYear || 2025}`
      : `Student · Batch ${user?.batchYear || 2026}`;

  const handleNavClick = (item) => {
    if (setScreen) {
      setScreen(item.key);
    }
    if (item.path) {
      navigate(item.path);
    }
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleBrandClick = () => {
    if (setScreen) setScreen('dashboard');
    navigate('/dashboard');
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }} role="button" tabIndex={0}>
        <div className="brand-mark">C</div>
        <div>
          <div className="brand-name">CorresBuddy</div>
          <div className="brand-sub">Knowledge across generations</div>
        </div>
      </div>

      <div className="nav-list">
        {currentNav.map((it) => (
          <button
            key={it.key}
            className={`nav-item ${screen === it.key ? 'active' : ''}`}
            onClick={() => handleNavClick(it)}
          >
            <Icon name={it.icon} className="nav-ic" />
            {it.label}
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        {/* View Mode Switcher: students and seniors can toggle their perspective */}
        {user?.email !== 'admin@celestia-trichy.me' && (
          <div className="role-preview">
            <div className="role-preview-label">Dashboard View</div>
            <div className="role-seg">
              {[
                { id: 'student', label: 'Student' },
                { id: 'senior', label: 'Senior' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={role === v.id ? 'active' : ''}
                  onClick={() => {
                    if (setRole) setRole(v.id);
                    if (setScreen) setScreen('dashboard');
                    navigate('/dashboard');
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin Badge for admin@celestia-trichy.me */}
        {user?.email === 'admin@celestia-trichy.me' && (
          <div style={{ marginBottom: 12, padding: '6px 10px', background: 'rgba(255, 196, 0, 0.15)', borderRadius: 8, fontSize: 11, fontWeight: 700, color: 'var(--brass-500)', textAlign: 'center' }}>
            👑 System Administrator
          </div>
        )}

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
