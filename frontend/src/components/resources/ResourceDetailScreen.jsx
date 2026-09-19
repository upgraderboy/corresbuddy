import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import { Badge, ResIcon } from '../common/CommonUI';
import { resourcesApi } from '../../services/api';
import { downloadResourceFile } from '../../utils/download.util';

export function ResourceDetailScreen({ resource, nav, saved = [], toggleSave }) {
  const params = useParams();
  const navigate = useNavigate();
  const targetId = resource?.id || params?.id;

  const [resData, setResData] = useState(resource || null);
  const [loading, setLoading] = useState(!resource && Boolean(targetId));
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (targetId && (!resData || resData.id !== targetId)) {
      setLoading(true);
      resourcesApi
        .getById(targetId)
        .then((res) => {
          if (res.data?.success && res.data?.resource) {
            setResData(res.data.resource);
          }
        })
        .catch((err) => {
          console.error('Failed to load resource by id:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [targetId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (nav) {
      nav('resources');
    } else {
      navigate('/resources');
    }
  };

  const r = resData || resource;

  if (loading) {
    return (
      <div>
        <button className="back-nav-btn" onClick={handleBack}>
          ← Back
        </button>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          Loading resource details...
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div>
        <button className="back-nav-btn" onClick={handleBack}>
          ← Back to directory
        </button>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          Resource not found or no longer available.
        </div>
      </div>
    );
  }

  const contributorName = r.contributor?.name || r.contributor || 'Priya Menon';
  const batchYear = r.batchYear || r.batch || 2025;
  const isSaved = Array.isArray(saved) && saved.includes(r.id);

  const handleDownload = async () => {
    setDownloading(true);
    const fileName = r.title ? `${r.title.replace(/[^a-z0-9_-]/gi, '_')}.pdf` : 'resource.pdf';
    await downloadResourceFile(r.id, fileName);
    setDownloading(false);
  };

  return (
    <div>
      <button className="back-nav-btn" onClick={handleBack}>
        ← Back
      </button>

      <div className="card" style={{ maxWidth: 760 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <div>
            <Badge tone="slate">{r.category}</Badge>
            <h2 style={{ fontSize: 23, marginTop: 10 }}>{r.title}</h2>
            <div className="subhead" style={{ marginTop: 6 }}>
              Contributed by {contributorName} · Batch {batchYear} ·{' '}
              {new Date(r.createdAt || Date.now()).toLocaleDateString([], {
                month: 'short',
                year: 'numeric',
              })}{' '}
              · Subject: {r.subject}
            </div>
          </div>
          <ResIcon type={r.fileType || 'pdf'} />
        </div>

        <div className="res-tags" style={{ marginTop: 14 }}>
          {(Array.isArray(r.tags)
            ? r.tags
            : typeof r.tags === 'string'
            ? (() => {
                try {
                  const p = JSON.parse(r.tags);
                  return Array.isArray(p) ? p : [r.tags];
                } catch {
                  return r.tags.split(',').map((t) => t.trim()).filter(Boolean);
                }
              })()
            : []
          ).map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>

        <div className="divider" />

        <p style={{ fontSize: 14.5, color: 'var(--text-600)', lineHeight: 1.7 }}>
          {r.description ||
            `This resource was preserved from batch ${batchYear} so future students preparing for ${r.subject} don't have to start from scratch. It has been reviewed and organised as part of the ${r.category?.toLowerCase()} collection.`}
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            <Icon name="download" />
            {downloading ? 'Downloading...' : 'Download File'}
          </button>
          {toggleSave && (
            <button className="btn btn-ghost" onClick={() => toggleSave(r.id)}>
              <Icon name="bookmark" />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailScreen;
