import React, { useEffect, useState } from 'react';
import { PageHead, Avatar, AssignmentBadge, Badge } from '../common/CommonUI';
import { corresApi } from '../../services/api';

export function MyJuniorsScreen({ nav }) {
  const [juniors, setJuniors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJuniors = async () => {
      try {
        const res = await corresApi.getMyJuniors();
        if (res.data.success) {
          setJuniors(res.data.juniors);
        }
      } catch (err) {
        console.error('Failed to load juniors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJuniors();
  }, []);

  return (
    <div>
      <PageHead
        title="My Juniors"
        subhead="Students automatically matched to you as their Corres."
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Junior</th>
              <th>Roll</th>
              <th>Assignment</th>
              <th>Activity</th>
              <th>Questions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {juniors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: 'var(--text-600)' }}>
                  No students currently assigned.
                </td>
              </tr>
            ) : (
              juniors.map((j, i) => (
                <tr key={j.id || i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Avatar
                        initials={j.initials || j.name.slice(0, 2).toUpperCase()}
                        size={30}
                      />
                      <span style={{ fontWeight: 600 }}>{j.name}</span>
                    </div>
                  </td>
                  <td>
                    {j.batch} / {j.roll || '—'}
                  </td>
                  <td>
                    <AssignmentBadge type={j.type || 'SAME_ROLL'} />
                  </td>
                  <td style={{ color: 'var(--text-600)' }}>{j.lastActive || 'Active today'}</td>
                  <td>
                    {j.questions > 0 ? (
                      <Badge tone="rust">{j.questions}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => nav('chat', { participantId: j.id, name: j.name })}
                    >
                      Message
                    </button>
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

export default MyJuniorsScreen;

