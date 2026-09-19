import React, { useEffect, useState } from 'react';
import { PageHead, Empty, Badge } from '../common/CommonUI';
import { adminApi } from '../../services/api';

export function AdminModerationScreen() {
  const [items, setItems] = useState([
    {
      id: 'm-1',
      type: 'Resource',
      title: '"Guaranteed Placement Hack" — flagged as misleading',
      reporter: '2 students',
    },
    {
      id: 'm-2',
      type: 'Question',
      title: 'Off-topic question flagged in Q&A',
      reporter: '1 student',
    },
    {
      id: 'm-3',
      type: 'Chat message',
      title: 'Reported message in a Corres conversation',
      reporter: '1 student',
    },
  ]);

  const handleDismiss = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRemove = async (item) => {
    try {
      if (item.type === 'Resource') {
        await adminApi.moderateResource(item.id, { action: 'remove' });
      } else if (item.type === 'Question') {
        await adminApi.moderateQuestion(item.id, { action: 'remove' });
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      // In prototype/seed mode, remove from local list
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  return (
    <div>
      <PageHead
        title="Moderation"
        subhead="Reported resources, questions and chat messages awaiting review."
      />

      {items.length === 0 ? (
        <Empty icon="shield" title="Queue is clear" body="Nothing needs review right now." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((m) => (
            <div
              className="card"
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div>
                <Badge tone="rust">{m.type}</Badge>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 8 }}>{m.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-600)', marginTop: 2 }}>
                  Reported by {m.reporter}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDismiss(m.id)}>
                  Dismiss
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleRemove(m)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminModerationScreen;

