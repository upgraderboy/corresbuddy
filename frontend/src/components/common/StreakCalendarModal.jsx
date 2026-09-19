import React from 'react';

export default function StreakCalendarModal({ isOpen, onClose, streakCount = 0, longestStreak = 0, totalContributions = 0, activeDates = [] }) {
  if (!isOpen) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate date keys for the streak (e.g. if streakCount > 0, highlight recent days)
  const streakSet = new Set(activeDates);
  if (streakSet.size === 0 && streakCount > 0) {
    // Generate recent streak days for display
    for (let i = 0; i < streakCount; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (d.getMonth() === month && d.getFullYear() === year) {
        streakSet.add(d.getDate());
      }
    }
  }

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      isToday: d === today.getDate(),
      isActive: streakSet.has(d) || (streakCount > 0 && d <= today.getDate() && d >= (today.getDate() - streakCount + 1))
    });
  }

  return (
    <div className="streak-modal-backdrop" onClick={onClose}>
      <div className="streak-modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Contribution Streak</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--slate-500)' }}>
                Keep sharing resources and answering queries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            style={{ width: '32px', height: '32px', border: 'none', background: 'transparent' }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Streak Stats Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          background: 'var(--paper-100)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          marginBottom: '18px'
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink-900)' }}>
              {streakCount} {streakCount === 1 ? 'day' : 'days'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)', fontWeight: 600 }}>Current Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink-900)' }}>
              {Math.max(longestStreak, streakCount)} {Math.max(longestStreak, streakCount) === 1 ? 'day' : 'days'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)', fontWeight: 600 }}>Longest Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--brass-600)' }}>
              {totalContributions}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)', fontWeight: 600 }}>Contributions</div>
          </div>
        </div>

        {/* Calendar View */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>
              {monthNames[month]} {year}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
              Highlighted in yellow: Active days
            </span>
          </div>

          <div className="calendar-grid">
            {dayNames.map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {calendarDays.map((item, idx) => (
              <div
                key={idx}
                className={`calendar-day-cell ${item.isActive ? 'active-streak' : ''} ${item.isToday ? 'today' : ''}`}
                style={{ visibility: item.day ? 'visible' : 'hidden' }}
              >
                {item.day}
              </div>
            ))}
          </div>
        </div>

        {/* Streak Tip */}
        <div style={{
          marginTop: '18px',
          padding: '10px 14px',
          background: 'var(--brass-100)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--ink-900)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span>💡</span>
          <span>Tip: Upload notes, answer junior queries, or share syllabus insights daily to extend your streak!</span>
        </div>
      </div>
    </div>
  );
}

