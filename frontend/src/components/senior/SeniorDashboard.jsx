import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Avatar, Badge } from '../common/CommonUI';
import { dashboardApi } from '../../services/api';

export function SeniorDashboard({ nav, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getSeniorDashboard();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load senior dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const streak = data?.streak || {
    current: 7,
    longest: 14,
    thisMonth: 5,
  };

  const juniors = data?.juniors || [
    { name: 'Ak', batch: 2026, roll: 9, type: 'SAME_ROLL', questions: 1 },
    { name: 'Sanjay R.', batch: 2026, roll: 41, type: 'SAME_ROLL', questions: 0 },
    { name: 'Meera K.', batch: 2026, roll: 87, type: 'SAME_ROLL', questions: 2 },
  ];

  const recentQuestions = data?.recentQuestions || [
    { id: 'q-1', title: 'How should I prepare for the DBMS CAT-2 exam?', subject: 'DBMS', time: '2h ago' },
    { id: 'q-2', title: 'Best approach to crack MCA placements at product companies?', subject: 'Placements', time: '1d ago' },
  ];

  return (
    <div>
      <PageHead
        eyebrow={`Welcome back, ${user?.name || 'Priya'}`}
        title="Dashboard"
        subhead="Your knowledge is still helping students two generations behind you."
      />

      {/* Streak Banner */}
      <div className="streak-band" style={{ marginBottom: 20 }}>
        <div className="streak-flame">
          <Icon name="flame" style={{ width: 24, height: 24 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontFamily: 'var(--font-d)', fontWeight: 600 }}>
            {streak.current} day contribution streak
          </div>
          <div style={{ fontSize: 13, color: '#C7D2E0' }}>
            Longest streak: {streak.longest} days · {streak.thisMonth} contributions this month
          </div>
        </div>
        <button className="btn btn-brass" onClick={() => nav('contributions')}>
          View details
        </button>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        {/* Your Juniors */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 16 }}>Your juniors</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('juniors')}>
              View all
            </button>
          </div>
          {juniors.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-600)' }}>No juniors assigned yet.</div>
          ) : (
            juniors.map((j, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < juniors.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <Avatar initials={j.initials || j.name.slice(0, 2).toUpperCase()} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{j.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-600)' }}>
                    Batch {j.batch} · Roll {j.roll}
                  </div>
                </div>
                {j.questions > 0 && <Badge tone="rust">{j.questions} new</Badge>}
              </div>
            ))
          )}
        </div>

        {/* Recent Questions */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 16 }}>Recent questions from juniors</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('qa')}>
              View all
            </button>
          </div>
          {recentQuestions.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-600)' }}>No active questions.</div>
          ) : (
            recentQuestions.slice(0, 2).map((q) => (
              <div
                key={q.id}
                onClick={() => nav('question', q)}
                style={{ marginBottom: 12, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{q.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-600)', marginTop: 2 }}>
                  {q.subject} · {q.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Contribution Actions */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontSize: 16 }}>Contribute something</h3>
        </div>
        <div className="grid grid-4">
          {[
            ['upload', 'Add Resource', 'Notes'],
            ['book', 'Upload Notes', 'Notes'],
            ['help', 'Share Advice', 'Advice'],
            ['layers', 'Add Timetable', 'Timetables'],
          ].map(([ic, label, cat]) => (
            <button
              key={label}
              className="btn btn-ghost"
              style={{ flexDirection: 'column', height: 80, gap: 6 }}
              onClick={() => nav('upload', { initialCategory: cat })}
            >
              <Icon name={ic} style={{ width: 20, height: 20 }} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeniorDashboard;

