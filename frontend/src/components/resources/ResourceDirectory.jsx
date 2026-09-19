import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Empty, ResIcon } from '../common/CommonUI';
import { resourcesApi } from '../../services/api';

const CATEGORIES = [
  'Study Material',
  'Notes',
  'Previous-Year Material',
  'Placement Resources',
  'Project Resources',
  'Interview Experiences',
  'Useful Links',
  'Advice',
  'Timetables',
  'Study Plans',
];

export function ResourceDirectory({ nav, saved, toggleSave }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourcesApi.listResources({
        category: cat !== 'All' ? cat : undefined,
        search: q.trim() || undefined,
      });
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [cat]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      fetchResources();
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await resourcesApi.getDownload(id);
      if (res.data.success && res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert('Could not download resource: ' + err.message);
    }
  };

  return (
    <div>
      <PageHead
        title="Resource Directory"
        subhead="Study material, notes, advice and plans preserved across every generation."
        action={
          <button className="btn btn-primary" onClick={() => nav('upload')}>
            <Icon name="upload" />
            Add resource
          </button>
        }
      />

      <div className="search-bar" style={{ marginBottom: 14 }}>
        <Icon name="search" />
        <input
          placeholder="Search resources, subjects, tags... (press Enter)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleSearchSubmit}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 12,
          marginBottom: 8,
        }}
      >
        <button
          className={`chip ${cat === 'All' ? 'active' : ''}`}
          onClick={() => setCat('All')}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${cat === c ? 'active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {resources.length === 0 ? (
        <Empty
          icon="book"
          title="No knowledge has been contributed here yet."
          body="Try a different category or search term."
        />
      ) : (
        <div className="grid grid-3">
          {resources.map((r) => (
            <div className="res-card" key={r.id}>
              <div className="res-top">
                <ResIcon type={r.fileType || 'pdf'} />
                <button
                  className="icon-btn"
                  style={{ width: 30, height: 30 }}
                  onClick={() => toggleSave(r.id)}
                  aria-label="Save resource"
                >
                  <Icon
                    name="bookmark"
                    style={{
                      color: saved.includes(r.id) ? 'var(--brass-500)' : 'var(--text-400)',
                    }}
                  />
                </button>
              </div>

              <div
                className="res-title"
                onClick={() => nav('resourceDetail', r)}
                style={{ cursor: 'pointer' }}
              >
                {r.title}
              </div>

              <div className="res-meta">
                {r.contributor?.name || r.contributor} · Batch {r.batchYear || r.batch} ·{' '}
                {new Date(r.createdAt || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </div>

              <div className="res-tags">
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

              <div className="res-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => nav('resourceDetail', r)}
                >
                  View
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownload(r.id, r.title)}
                >
                  <Icon name="download" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceDirectory;

