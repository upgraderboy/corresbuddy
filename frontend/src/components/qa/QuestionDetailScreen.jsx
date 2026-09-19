import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { Badge, Avatar } from '../common/CommonUI';
import { qaApi } from '../../services/api';

export function QuestionDetailScreen({ question, nav, user }) {
  const [qData, setQData] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestionDetails = async () => {
    if (!question?.id) return;
    try {
      const res = await qaApi.getQuestion(question.id);
      if (res.data.success) {
        setQData(res.data.question);
      }
    } catch (err) {
      console.error('Failed to load question details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionDetails();
  }, [question?.id]);

  const q = qData || question || {};

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setSubmitting(true);
    try {
      await qaApi.addAnswer(q.id, { content: draft.trim() });
      setDraft('');
      await fetchQuestionDetails();
    } catch (err) {
      alert('Failed to post answer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (ansId) => {
    try {
      await qaApi.acceptAnswer(ansId);
      await fetchQuestionDetails();
    } catch (err) {
      alert('Failed to accept answer: ' + err.message);
    }
  };

  const isQuestionAsker = q.askerId === user?.id || q.asker === 'You' || q.asker === user?.name;

  return (
    <div>
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 16 }}
        onClick={() => nav('qa')}
      >
        ← Back to Q&A
      </button>

      <div className="card" style={{ maxWidth: 720, marginBottom: 18 }}>
        <Badge tone="slate">{q.subject || 'General'}</Badge>
        <h2 style={{ fontSize: 21, marginTop: 10 }}>{q.title}</h2>
        <div className="subhead" style={{ marginTop: 6 }}>
          Asked by {q.asker} · {q.time || 'Recently'}
        </div>
        {q.description && (
          <p style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-900)' }}>
            {q.description}
          </p>
        )}
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 12 }}>
        {q.answersList?.length || q.answers || 0} Answer
        {(q.answersList?.length || q.answers) !== 1 ? 's' : ''}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
        {(q.answersList || []).length === 0 ? (
          <div className="card" style={{ color: 'var(--text-600)', textAlign: 'center', padding: 24 }}>
            No answers yet. Be the first to share your knowledge!
          </div>
        ) : (
          q.answersList.map((a, i) => (
            <div className={`answer-box ${a.accepted ? 'accepted' : ''}`} key={a.id || i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Avatar
                    initials={(a.author || 'U')
                      .split(' ')
                      .map((s) => s[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                    size={30}
                  />
                  <b style={{ fontSize: 13.5 }}>{a.author}</b>
                  <span style={{ fontSize: 12, color: 'var(--text-600)' }}>
                    · Batch {a.batch || '2025'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {a.accepted && (
                    <Badge tone="sage" icon="check">
                      Accepted
                    </Badge>
                  )}
                  {isQuestionAsker && !a.accepted && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                      onClick={() => handleAcceptAnswer(a.id)}
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{a.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: 18, maxWidth: 720 }}>
        <form onSubmit={handlePostAnswer}>
          <div className="field">
            <label>Add an answer</label>
            <textarea
              className="ta"
              rows="3"
              placeholder="Share what worked for you..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post answer'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuestionDetailScreen;

