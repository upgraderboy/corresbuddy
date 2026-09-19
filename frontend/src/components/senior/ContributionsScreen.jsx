import React, { useEffect, useState } from 'react';
import { PageHead, StatCard } from '../common/CommonUI';
import { streakApi, contributionsApi } from '../../services/api';

export function ContributionsScreen() {
  const [streak, setStreak] = useState({
    currentStreak: 7,
    longestStreak: 14,
    resourcesShared: 6,
    questionsAnswered: 9,
  });
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate 70 cells for the contribution heatmap grid
  const calCells = Array.from({ length: 70 }, (_, i) =>
    i % 9 === 0 ? 0 : i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0
  );

  useEffect(() => {
    const loadContributions = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          streakApi.getMyStreak(),
          contributionsApi.getMyContributions(),
        ]);
        if (sRes.data.success) {
          setStreak(sRes.data);
        }
        if (cRes.data.success) {
          setContributions(cRes.data.contributions);
        }
      } catch (err) {
        console.error('Failed to load contributions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContributions();
  }, []);

  return (
    <div>
      <PageHead
        title="Contributions"
        subhead="Consistency, not volume — a record of what you've passed on."
      />

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard num={streak.currentStreak || streak.current || 0} label="Current streak" />
        <StatCard num={streak.longestStreak || streak.longest || 0} label="Longest streak" />
        <StatCard num={streak.resourcesShared || 0} label="Resources shared" />
        <StatCard num={streak.questionsAnswered || 0} label="Questions answered" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, marginBottom: 12 }}>Contribution calendar</h4>
        <div className="cal-grid">
          {calCells.map((v, i) => (
            <div key={i} className={`cal-cell ${v > 0 ? 'l' + v : ''}`} />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginTop: 10,
            fontSize: 12,
            color: 'var(--text-600)',
          }}
        >
          Less <span className="cal-cell" style={{ width: 12, height: 12 }} />
          <span className="cal-cell l1" style={{ width: 12, height: 12 }} />
          <span className="cal-cell l2" style={{ width: 12, height: 12 }} />
          <span className="cal-cell l3" style={{ width: 12, height: 12 }} /> More
        </div>
      </div>

      <div className="card">
        <h4 style={{ fontSize: 14, marginBottom: 12 }}>Recent contribution history</h4>
        {contributions.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-600)', padding: '10px 0' }}>
            No recent contributions recorded.
          </div>
        ) : (
          contributions.slice(0, 6).map((c, i) => (
            <div
              key={c.id || i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < contributions.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ fontSize: 13.5 }}>
                <b>{c.type}</b> — {c.title}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-600)' }}>
                {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContributionsScreen;

