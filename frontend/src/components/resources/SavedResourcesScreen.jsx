import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Empty, ResIcon } from '../common/CommonUI';
import { resourcesApi } from '../../services/api';
import { downloadResourceFile } from '../../utils/download.util';

export function SavedResourcesScreen({ saved, nav, toggleSave }) {
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await resourcesApi.getSavedResources();
        if (res.data.success) {
          setSavedResources(res.data.resources);
        }
      } catch (err) {
        console.error('Failed to load saved resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [saved]);

  const handleDownload = async (id, title) => {
    const fileName = title ? `${title.replace(/[^a-z0-9_-]/gi, '_')}.pdf` : 'resource.pdf';
    await downloadResourceFile(id, fileName);
  };

  return (
    <div>
      <PageHead
        title="Saved Resources"
        subhead="Your personal shortlist from the knowledge repository."
      />

      {savedResources.length === 0 ? (
        <Empty
          icon="bookmark"
          title="Nothing saved yet"
          body="Bookmark resources from the directory to find them here later."
        />
      ) : (
        <div className="grid grid-3">
          {savedResources.map((r) => (
            <div className="res-card" key={r.id}>
              <div className="res-top">
                <ResIcon type={r.fileType || 'pdf'} />
                <button
                  className="icon-btn"
                  style={{ width: 30, height: 30 }}
                  onClick={() => toggleSave(r.id)}
                  aria-label="Remove from saved"
                >
                  <Icon name="bookmark" style={{ color: 'var(--brass-500)' }} />
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
                {r.contributor?.name || r.contributor} · Batch {r.batchYear || r.batch}
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

export default SavedResourcesScreen;

