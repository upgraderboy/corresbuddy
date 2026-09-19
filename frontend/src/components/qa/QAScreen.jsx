import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { PageHead, Empty, Badge } from '../common/CommonUI';
import { qaApi } from '../../services/api';

export function QAScreen({ nav, user }) {
  const [tab, setTab] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);

  // Ask question form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('General');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await qaApi.listQuestions({
        answered: tab === 'unanswered' ? false : undefined,
      });
      if (res.data.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [tab]);

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await qaApi.createQuestion({ title, description, subject });
      setShowAskModal(false);
      setTitle('');
      setDescription('');
      fetchQuestions();
    } catch (err) {
      alert('Failed to post question: ' + err.message);
    }
  };

  const filteredList =
    tab === 'mine'
      ? questions.filter((q) => q.asker === 'You' || q.asker === user?.name || q.askerId === user?.id)
      : tab === 'unanswered'
      ? questions.filter((q) => q.answers === 0)
      : questions;

  return (
    <div>
      <PageHead
        title="Q&A"
        subhead="Permanent institutional answers, not disappearing chat threads."
        action={
          <button className="btn btn-primary" onClick={() => setShowAskModal(true)}>
            <Icon name="plus" />
            Ask a question
          </button>
        }
      />

      {showAskModal && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--ink-900)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 17 }}>Ask a question to seniors</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAskModal(false)}>
              ✕
            </button>
          </div>
          <form onSubmit={handleAskSubmit}>
            <div className="field">
              <label>Question title</label>
              <input
                className="input"
                placeholder="e.g. How should I prepare for the DBMS CAT-2 exam?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-2">
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
              <label>Details / Background</label>
              <textarea
                className="ta"
                rows="3"
                placeholder="Give details on the syllabus, professor expectations, or where you're stuck..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">
                Post question
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAskModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tab-row">
        <button
          className={`tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          All questions
        </button>
        <button
          className={`tab-btn ${tab === 'mine' ? 'active' : ''}`}
          onClick={() => setTab('mine')}
        >
          My questions
        </button>
        <button
          className={`tab-btn ${tab === 'unanswered' ? 'active' : ''}`}
          onClick={() => setTab('unanswered')}
        >
          Unanswered
        </button>
      </div>

      {filteredList.length === 0 ? (
        <Empty icon="help" title="Nothing here yet" body="Try a different tab or ask a question." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredList.map((q) => (
            <div className="q-card" key={q.id} onClick={() => nav('question', q)}>
              <div className="q-stat">
                <b>{q.answers}</b>
                <span>Answers</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{q.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-600)', marginTop: 4 }}>
                  {q.subject} · asked by {q.asker} · {q.time || 'Recently'}
                </div>
              </div>
              {q.accepted && (
                <Badge tone="sage" icon="check">
                  Answered
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QAScreen;

