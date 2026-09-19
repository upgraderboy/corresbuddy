import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, StatCard, AssignmentBadge } from '../common/CommonUI';
import { corresApi, dashboardApi } from '../../services/api';

export function AdminAssignmentsScreen() {
  const [assignments, setAssignments] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ sameRoll: 0, fallback: 0 });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const [res, dashRes] = await Promise.allSettled([
        corresApi.listAssignments(),
        dashboardApi.getAdminDashboard(),
      ]);

      if (res.status === 'fulfilled' && res.value?.data?.success) {
        setAssignments(res.value.data.assignments || []);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.success) {
        setStats({
          sameRoll: dashRes.value.data.stats?.sameRoll || 0,
          fallback: dashRes.value.data.stats?.fallback || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleRunAssignment = async () => {
    setRunning(true);
    try {
      await corresApi.runBatchAssignment('2026');
      await fetchAssignments();
    } catch (err) {
      alert('Failed to run assignment: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  const sameRollCalculated = assignments.filter((a) => a.type === 'SAME_ROLL').length;
  const fallbackCalculated = assignments.filter((a) => a.type === 'FALLBACK_TOP_PERFORMER').length;

  const sameRollCount = assignments.length > 0 ? sameRollCalculated : stats.sameRoll;
  const fallbackCount = assignments.length > 0 ? fallbackCalculated : stats.fallback;

  return (
    <div>
      <PageHead
        title="Corres Assignment Management"
        subhead="Batch 2026 → Batch 2025"
        action={
          <button
            className="btn btn-primary"
            onClick={handleRunAssignment}
            disabled={running}
          >
            <Icon name="branch" />
            {running ? 'Running engine…' : 'Run assignment'}
          </button>
        }
      />

      {running && (
        <div className="hint-banner">
          <Icon name="clock" />
          <div>
            <b>Running assignment engine…</b>
            Matching roll numbers across batch 2026 and batch 2025.
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <StatCard num={sameRollCount} label="Same roll number matches" />
        <StatCard num={fallbackCount} label="Top performer fallbacks" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Junior</th>
              <th>Roll</th>
              <th>Assigned Corres</th>
              <th>Senior Roll</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-600)' }}>
                  No assignments found. Click "Run assignment" above to generate matches.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{a.junior?.name || 'Student'}</b>
                  </td>
                  <td>{a.junior?.rollNumber || '—'}</td>
                  <td>
                    {a.senior?.name || 'Senior'}
                    {a.type === 'FALLBACK_TOP_PERFORMER' && ' (Top Performer)'}
                  </td>
                  <td>{a.senior?.rollNumber || '—'}</td>
                  <td>
                    <AssignmentBadge type={a.type} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAssignmentsScreen;

