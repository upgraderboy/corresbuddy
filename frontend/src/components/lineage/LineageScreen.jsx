import React, { useEffect, useState } from 'react';
import { PageHead, Badge, Avatar, StatCard, Empty, ResIcon } from '../common/CommonUI';
import { lineageApi } from '../../services/api';

export function LineageScreen({ user, nav }) {
  const [lineageData, setLineageData] = useState(null);
  const [sel, setSel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLineage = async () => {
      try {
        const res = await lineageApi.getMyLineage();
        if (res.data.success) {
          setLineageData(res.data);
          // Default selection to Corres if available (index 1)
          if (res.data.generations?.length > 1) {
            setSel(1);
          } else {
            setSel(0);
          }
        }
      } catch (err) {
        console.error('Failed to load lineage:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLineage();
  }, []);

  const generations = lineageData?.generations || [
    { batch: 2026, roll: 9, label: 'You', you: true, contributions: 0, resources: 0 },
    { batch: 2025, roll: 9, label: 'Priya Menon', you: false, role: 'Corres', contributions: 14, resources: 6 },
    { batch: 2024, roll: 9, label: 'Karthik Suresh', you: false, contributions: 9, resources: 4 },
    { batch: 2023, roll: 9, label: 'Divya Nair', you: false, contributions: 11, resources: 5 },
    { batch: 2022, roll: 9, label: 'Arjun Verma', you: false, contributions: 6, resources: 2 },
  ];

  const g = generations[sel] || generations[0];

  return (
    <div>
      <PageHead
        title="Generational History"
        subhead="Your academic lineage — same seat, five generations of students."
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column: Lineage Timeline */}
        <div className="card">
          <div className="lineage">
            {generations.map((gen, i) => (
              <div
                key={i}
                className={`lineage-node ${gen.you ? 'you' : ''} ${i === sel ? 'selected' : ''}`}
                onClick={() => setSel(i)}
              >
                <div className="lineage-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <b style={{ fontSize: 14 }}>
                      {gen.batch} · Roll {gen.roll}
                    </b>
                    {gen.you && <Badge tone="brass">You</Badge>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-600)', marginTop: 2 }}>
                    {gen.label || gen.name}
                    {gen.role ? ` · ${gen.role}` : ''}
                  </div>
                  {!gen.you && (
                    <div style={{ fontSize: 12, color: 'var(--text-400)', marginTop: 4 }}>
                      {gen.contributions || 0} contributions · {gen.resources || 0} resources
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Generation Details */}
        <div className="card">
          {g.you ? (
            <Empty
              icon="layers"
              title="This is you"
              body="Your contributions will appear here once you start sharing knowledge with the batches that follow."
            />
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <Avatar
                  initials={
                    (g.label || g.name || 'U')
                      .split(' ')
                      .map((s) => s[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  }
                  size={48}
                  tone="var(--ink-900)"
                />
                <div>
                  <b style={{ fontSize: 16 }}>{g.label || g.name}</b>
                  <div className="subhead">
                    Batch {g.batch} · Roll {g.roll}
                  </div>
                </div>
              </div>

              <div className="grid grid-3" style={{ marginBottom: 16 }}>
                <StatCard num={g.contributions || 0} label="Contributions" />
                <StatCard num={g.resources || 0} label="Resources" />
                <StatCard num={g.answersCount || 3} label="Answers given" />
              </div>

              <h4 style={{ fontSize: 14, marginBottom: 10 }}>Resources shared</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(g.resourcesList || []).length > 0 ? (
                  g.resourcesList.map((r) => (
                    <div
                      key={r.id}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => nav('resourceDetail', r)}
                    >
                      <ResIcon type={r.fileType || 'pdf'} />
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.title}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text-600)' }}>
                    Previous batch data is not available yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LineageScreen;

