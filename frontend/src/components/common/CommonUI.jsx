import React from 'react';
import Icon from './Icon';

export function Badge({ tone = 'slate', icon, children, className = '' }) {
  return (
    <span className={`badge badge-${tone} ${className}`}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}

export function Empty({ icon = 'book', title, body }) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <div className="empty-title">{title}</div>
      <div>{body}</div>
    </div>
  );
}

export function PageHead({ eyebrow, title, subhead, action }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subhead && <div className="subhead">{subhead}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ num, label }) {
  return (
    <div className="stat-card">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Avatar({ initials, size = 40, tone }) {
  const style = {
    width: size,
    height: size,
    borderRadius: size > 44 ? 14 : '50%',
    fontSize: size * 0.36,
  };
  return (
    <div
      className="avatar"
      style={{
        ...style,
        background: tone || 'var(--brass-100)',
        color: tone ? '#fff' : 'var(--brass-600)',
      }}
    >
      {initials}
    </div>
  );
}

export function AssignmentBadge({ type }) {
  return type === 'SAME_ROLL' ? (
    <Badge tone="sage" icon="check">
      Same Roll Number
    </Badge>
  ) : (
    <Badge tone="brass" icon="star">
      Top Performer Fallback
    </Badge>
  );
}

export function ResIcon({ type }) {
  const n = type === 'link' ? 'branch' : type === 'image' ? 'star' : 'book';
  return (
    <div className="res-icon">
      <Icon name={n} />
    </div>
  );
}

export function HintBanner({ icon = 'branch', title, children }) {
  return (
    <div className="hint-banner">
      <Icon name={icon} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        {title && <b>{title}</b>}
        {children}
      </div>
    </div>
  );
}

export default {
  Badge,
  Empty,
  PageHead,
  StatCard,
  Avatar,
  AssignmentBadge,
  ResIcon,
  HintBanner,
};

