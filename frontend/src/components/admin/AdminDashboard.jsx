import React, { useEffect, useState } from 'react';
import { PageHead, StatCard, Badge } from '../common/CommonUI';
import { dashboardApi } from '../../services/api';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 229,
    seniors: 114,
    batches: 5,
    resources: 186,
    sameRoll: 114,
    fallback: 1,
    pending: 3,
    contributions: 412,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getAdminDashboard();
        if (res.data.success && res.data.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <PageHead
        title="Admin Dashboard"
        subhead="Platform-wide view of users, assignments and contributions."
      />

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard num={stats.students} label="Total students" />
        <StatCard num={stats.seniors} label="Total seniors" />
        <StatCard num={stats.batches} label="Active batches" />
        <StatCard num={stats.resources} label="Resources" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Corres assignments</h4>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div className="stat-num" style={{ fontSize: 24 }}>
                {stats.sameRoll}
              </div>
              <div className="stat-label">
                <Badge tone="sage">Same Roll</Badge>
              </div>
            </div>
            <div>
              <div className="stat-num" style={{ fontSize: 24 }}>
                {stats.fallback}
              </div>
              <div className="stat-label">
                <Badge tone="brass">Fallback</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Moderation queue</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="stat-num" style={{ fontSize: 24, color: 'var(--rust-500)' }}>
              {stats.pending}
            </div>
            <div className="stat-label">items pending review</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h4 style={{ fontSize: 14, marginBottom: 12 }}>Contributions this month</h4>
        <div className="stat-num" style={{ fontSize: 26 }}>
          {stats.contributions}
        </div>
        <div className="stat-label">Across resources, notes, advice and answers</div>
      </div>
    </div>
  );
}

export default AdminDashboard;

