import React, { useState } from 'react';
import { PageHead, Avatar, StatCard } from '../common/CommonUI';
import { usersApi } from '../../services/api';

export function ProfileScreen({ role, user }) {
  const [bio, setBio] = useState(
    user?.bio ||
      (role === 'senior'
        ? 'Placed at a product company. Happy to help juniors with DBMS and interview prep.'
        : 'MCA student interested in backend systems and API design.')
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      await usersApi.updateProfile(user.id, { bio });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
    : role === 'senior'
    ? 'PM'
    : 'AK';

  return (
    <div>
      <PageHead title="Profile" subhead="Your academic identity on CorresBuddy." />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <Avatar initials={initials} size={64} tone="var(--ink-900)" />
            <div>
              <h3 style={{ fontSize: 19 }}>{user?.name || (role === 'senior' ? 'Priya Menon' : 'Ak')}</h3>
              <div className="subhead">
                {user?.program || 'MCA'} · {user?.branch || 'Computer Applications'}
              </div>
            </div>
          </div>

          <div className="field">
            <label>College</label>
            <input className="input" defaultValue={user?.college || 'VIT Vellore'} readOnly />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label>Batch</label>
              <input
                className="input"
                defaultValue={user?.batchYear || (role === 'senior' ? 2025 : 2026)}
                readOnly
              />
            </div>
            <div className="field">
              <label>Roll number</label>
              <input
                className="input"
                defaultValue={user?.rollNumber || 9}
                readOnly
              />
            </div>
          </div>

          <div className="field">
            <label>Bio</label>
            <textarea
              className="ta"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : savedSuccess ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>

        <div className="card">
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>
            {role === 'senior' ? 'Contribution summary' : 'Activity summary'}
          </h4>
          <div className="grid grid-2">
            <StatCard
              num={role === 'senior' ? 6 : 2}
              label={role === 'senior' ? 'Resources shared' : 'Resources saved'}
            />
            <StatCard
              num={role === 'senior' ? 9 : 1}
              label={role === 'senior' ? 'Questions answered' : 'Questions asked'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;

