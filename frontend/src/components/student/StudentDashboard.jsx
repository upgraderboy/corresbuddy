import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Avatar, AssignmentBadge, ResIcon } from '../common/CommonUI';
import { dashboardApi } from '../../services/api';

export function StudentDashboard({ nav, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getStudentDashboard();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const corres = data?.corres || {
    name: 'Priya Menon',
    initials: 'PM',
    batch: 2025,
    roll: user?.rollNumber || 9,
    type: 'SAME_ROLL',
    headline: 'Placed at a product company; strong in DBMS & interview prep',
    online: true,
  };

  const lineage = data?.lineage || [
    { batch: user?.batchYear || 2026, roll: user?.rollNumber || 9, label: 'You', you: true },
    { batch: 2025, roll: user?.rollNumber || 9, label: 'Priya Menon', you: false, resources: 6 },
    { batch: 2024, roll: user?.rollNumber || 9, label: 'Karthik Suresh', you: false, resources: 4 },
  ];

  const resources = data?.recentResources || [];
  const questions = data?.recentQuestions || [];
  const notifications = data?.notifications || [];

  const streak = data?.streak || {
    current: user?.streak?.currentStreak ?? user?.streakCount ?? 0,
    longest: user?.streak?.longestStreak ?? user?.longestStreak ?? 0,
    thisMonth: user?.streak?.thisMonthCount ?? 0,
  };

  return (
    <div>
      <PageHead
        eyebrow={`Good to see you, ${user?.name || 'Ak'}`}
        title="Dashboard"
        subhead="Everything preserved for you by the generations before you, in one place."
      />

      {streak.current > 0 && (
        <div className="streak-band" style={{ marginBottom: 20 }}>
          <div className="streak-flame">
            <Icon name="flame" style={{ width: 24, height: 24 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-d)', fontWeight: 600 }}>
              {streak.current} day contribution streak
            </div>
            <div style={{ fontSize: 13, color: '#C7D2E0' }}>
              Longest streak: {streak.longest} days · {streak.thisMonth} contributions this month
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 20, alignItems: 'stretch' }}>
        {/* Assigned Corres Card */}
        <div className="corres-card">
          <div className="corres-card-top">
            <Avatar initials={corres.initials || 'PM'} size={58} tone="var(--ink-900)" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>
                    Your assigned Corres
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{corres.name}</div>
                </div>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--sage-500)',
                    marginTop: 6,
                  }}
                  title="Online"
                />
              </div>
              <div className="subhead" style={{ marginTop: 4 }}>
                Batch {corres.batch} · Roll {corres.roll || '—'}
              </div>
              <div style={{ marginTop: 10 }}>
                <AssignmentBadge type={corres.type} />
              </div>
            </div>
          </div>
          <div className="corres-card-foot">
            <button onClick={() => nav('chat')}>
              <Icon name="message" />
              Message
            </button>
            <button onClick={() => nav('corres')}>
              <Icon name="chevronRight" />
              View profile
            </button>
          </div>
        </div>

        {/* Generational History Preview */}
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Generational History
          </div>
          <div className="lineage" style={{ paddingLeft: 24 }}>
            {lineage.map((g, i) => (
              <div
                className={`lineage-node ${g.you ? 'you' : ''}`}
                key={i}
                style={{ paddingBottom: i === lineage.length - 1 ? 0 : 16 }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {g.batch} · Roll {g.roll}
                  {g.you ? ' · You' : ''}
                </div>
                {!g.you && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-600)' }}>
                    {g.label || g.name} · {g.resources || 0} resources shared
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 6 }}
            onClick={() => nav('lineage')}
          >
            See full lineage <Icon name="chevronRight" />
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        {/* Recent Resources */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 16 }}>Recent resources</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('resources')}>
              Browse all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resources.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-600)' }}>
                No knowledge has been contributed here yet.
              </div>
            ) : (
              resources.slice(0, 3).map((r) => (
                <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ResIcon type={r.type || 'pdf'} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                      onClick={() => nav('resourceDetail', r)}
                    >
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-600)' }}>
                      {r.contributor} · Batch {r.batch}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Q&A */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 16 }}>Recent Q&A</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('qa')}>
              View all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-600)' }}>No questions asked yet.</div>
            ) : (
              questions.slice(0, 2).map((q) => (
                <div
                  key={q.id}
                  onClick={() => nav('question', q)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-600)', marginTop: 2 }}>
                    {q.answers} answer{q.answers !== 1 ? 's' : ''} · {q.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notifications preview */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h3 style={{ fontSize: 16 }}>Notifications</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('notifications')}>
            View all
          </button>
        </div>
        {notifications.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-600)' }}>No new notifications.</div>
        ) : (
          notifications.slice(0, 2).map((n) => (
            <div className="notif-item" key={n.id}>
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

export default StudentDashboard;

