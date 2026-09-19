import React, { useState } from 'react';
import Icon from '../common/Icon';
import { PageHead } from '../common/CommonUI';
import { resourcesApi } from '../../services/api';

const CATEGORIES = [
  'Notes',
  'Study Material',
  'Previous-Year Material',
  'Placement Resources',
  'Project Resources',
  'Interview Experiences',
  'Useful Links',
  'Advice',
  'Timetables',
  'Study Plans',
];

export function UploadResourceScreen({ nav, role, screenData }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(screenData?.initialCategory || 'Notes');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject) {
      setError('Title and subject are required');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // 1. Create metadata in PostgreSQL
      const createRes = await resourcesApi.createResource({
        title,
        description,
        category,
        subject,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        fileType: file ? file.name.split('.').pop().toLowerCase() : 'pdf',
      });

      const resourceId = createRes.data.resource.id;

      // 2. If file attached, upload to S3 / disk
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await resourcesApi.uploadFile(resourceId, formData);
      }

      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="back-nav-btn"
        onClick={() => (nav ? nav('resources') : window.history.back())}
      >
        ← Back to resources
      </button>

      <PageHead
        title="Upload Resource"
        subhead="Share something the next batch will thank you for."
      />

      <div className="card" style={{ maxWidth: 640 }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--sage-100)',
                color: 'var(--sage-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Icon name="check2" style={{ width: 24, height: 24 }} />
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>Resource published</h3>
            <p className="subhead" style={{ marginBottom: 18 }}>
              It's now visible to every future batch searching "{subject}" or browsing {category}.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => nav(role === 'senior' ? 'dashboard' : 'resources')}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: 'var(--rust-100)',
                  color: 'var(--rust-500)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div className="field">
              <label>Title</label>
              <input
                className="input"
                placeholder="e.g. DBMS Complete Notes — Unit 1 to 5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="field">
                <label>Category</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Subject</label>
                <input
                  className="input"
                  placeholder="e.g. DBMS"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Tags (comma separated)</label>
              <input
                className="input"
                placeholder="DBMS, CAT-2, Exam"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Description / Advice</label>
              <textarea
                className="ta"
                rows="3"
                placeholder="Add context, tips, or guidance on how to use this resource..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field">
              <label>File (PDF, Image, Document)</label>
              <label
                style={{
                  border: '1.5px dashed var(--border)',
                  borderRadius: 12,
                  padding: '26px 16px',
                  textAlign: 'center',
                  color: 'var(--text-600)',
                  display: 'block',
                  cursor: 'pointer',
                  background: file ? 'var(--paper-100)' : 'transparent',
                }}
              >
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
                />
                <Icon name="upload" style={{ width: 22, height: 22, marginBottom: 6 }} />
                <div style={{ fontSize: 13.5 }}>
                  {file ? (
                    <b>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</b>
                  ) : (
                    'Drop a PDF, image or document, or click to browse'
                  )}
                </div>
              </label>
            </div>

            {uploading && (
              <div style={{ marginBottom: 14 }}>
                <div className="skeleton" style={{ height: 8, width: '100%' }} />
                <div style={{ fontSize: 12, color: 'var(--text-600)', marginTop: 6 }}>
                  Uploading to knowledge repository and S3…
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={uploading}
            >
              {uploading ? 'Publishing…' : 'Publish resource'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UploadResourceScreen;

