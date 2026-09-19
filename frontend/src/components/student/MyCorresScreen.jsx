import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Avatar, AssignmentBadge, Badge, ResIcon, HintBanner } from '../common/CommonUI';
import { corresApi, resourcesApi } from '../../services/api';

export function MyCorresScreen({ nav, user }) {
  const [corresData, setCorresData] = useState(null);
  const [corresResources, setCorresResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCorres = async () => {
      try {
        const res = await corresApi.getMyCorres();
        if (res.data.success && res.data.corres) {
          setCorresData(res.data);
          // Fetch resources contributed by this senior
          const rRes = await resourcesApi.listResources({ author: res.data.corres.name });
          if (rRes.data.success) {
            setCorresResources(rRes.data.resources);
          }
        }
      } catch (err) {
        console.error('Failed to load Corres:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCorres();
  }, []);

  const corres = corresData?.corres || {
    id: 'priya-default',
    name: 'Priya Menon',
    initials: 'PM',
    batch: 2025,
    roll: user?.rollNumber || 9,
    headline: 'Placed at a product company; strong in DBMS & interview prep',
  };

  const assignmentType = corresData?.assignmentType || 'SAME_ROLL';
  const reason = corresData?.reason || 'Same roll number found in batch 2025';

  return (
    <div>
      <PageHead
        title="My Corres"
        subhead="Automatically matched by roll number from the previous batch."
      />

      <div className="corres-card" style={{ maxWidth: 640 }}>
        <div className="corres-card-top">
          <Avatar initials={corres.initials || 'PM'} size={64} tone="var(--ink-900)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 19 }}>{corres.name}</div>
            <div className="subhead" style={{ marginTop: 2 }}>
              Batch {corres.batch} · Roll {corres.roll || '—'} · {corres.headline}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <AssignmentBadge type={assignmentType} />
              <Badge tone="slate">Online</Badge>
            </div>
          </div>
        </div>
        <div className="corres-card-foot">
          <button className="btn-ghost" onClick={() => nav('chat')}>
            <Icon name="message" />
            Message
          </button>
          <button className="btn-ghost" onClick={() => nav('resources')}>
            <Icon name="book" />
            Their resources
          </button>
        </div>
      </div>

      <div style={{ marginTop: 22, maxWidth: 640 }}>
        <HintBanner icon="branch" title="How this match was made">
          {assignmentType === 'SAME_ROLL'
            ? `Your roll number, ${user?.rollNumber || 9}, exists in batch ${corres.batch} — so you were matched directly with that student rather than a fallback top performer.`
            : `No senior with your exact roll number was found in batch ${corres.batch}. A top-performing senior has been assigned as your Corres.`}
        </HintBanner>
      </div>

      <div className="card" style={{ marginTop: 22, maxWidth: 640 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Contributed by {corres.name}</h3>
        {corresResources.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-600)' }}>
            No knowledge has been contributed here yet.
          </div>
        ) : (
          <div className="grid grid-2">
            {corresResources.map((r) => (
              <div
                className="res-card"
                key={r.id}
                onClick={() => nav('resourceDetail', r)}
                style={{ cursor: 'pointer' }}
              >
                <div className="res-top">
                  <ResIcon type={r.fileType || 'pdf'} />
                  <Badge tone="slate">{r.category}</Badge>
                </div>
                <div className="res-title">{r.title}</div>
                <div className="res-meta">
                  {r.subject} · {new Date(r.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCorresScreen;

