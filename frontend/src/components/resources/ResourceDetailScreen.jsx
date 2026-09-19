import React from 'react';
import Icon from '../common/Icon';
import { Badge, ResIcon } from '../common/CommonUI';
import { resourcesApi } from '../../services/api';

export function ResourceDetailScreen({ resource, nav, saved, toggleSave }) {
  if (!resource) {
    return (
      <div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => nav('resources')}>
          ← Back to directory
        </button>
        <div className="card">Resource not found.</div>
      </div>
    );
  }

  const r = resource;
  const contributorName = r.contributor?.name || r.contributor || 'Priya Menon';
  const batchYear = r.batchYear || r.batch || 2025;
  const isSaved = saved.includes(r.id);

  const handleDownload = async () => {
    try {
      const res = await resourcesApi.getDownload(r.id);
      if (res.data.success && res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert('Could not download file: ' + err.message);
    }
  };

  return (
    <div>
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
        onClick={() => nav('resources')}
      >
        ← Back to directory
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
          <button className="btn btn-primary" onClick={handleDownload}>
            <Icon name="download" />
            Download
          </button>
          <button className="btn btn-ghost" onClick={() => toggleSave(r.id)}>
            <Icon name="bookmark" />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailScreen;

