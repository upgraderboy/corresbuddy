import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen({ onLogin, goRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('ak@vitstudent.ac.in');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (onLogin) onLogin();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark">C</div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 600 }}>
            CorresBuddy
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          <h1 style={{ color: '#fff', fontSize: 34, lineHeight: 1.2, marginBottom: 14 }}>
            What one generation learns should not be lost when it graduates.
          </h1>
          <p style={{ color: '#B9C6D8', fontSize: 15, lineHeight: 1.6 }}>
            Every student is automatically matched with the senior who sat in their exact seat —
            same roll number, previous batch — so nothing has to be rediscovered from scratch.
          </p>

          <div style={{ marginTop: 26 }}>
            <div className="gen-line">
              <span className="gen-dot" /> 2026 · Roll 09 · You
            </div>
            <div className="gen-line">
              <span className="gen-dot" /> 2025 · Roll 09 · Priya Menon (Corres)
            </div>
            <div className="gen-line">
              <span className="gen-dot" /> 2024 · Roll 09 · Karthik Suresh
            </div>
            <div className="gen-line">
              <span className="gen-dot" /> 2023 · Roll 09 · Divya Nair
            </div>
          </div>
        </div>

        <div style={{ color: '#7C8AA0', fontSize: 12.5 }}>
          VIT Vellore · MCA · Computer Applications
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Welcome back</h2>
          <p className="subhead" style={{ marginBottom: 20 }}>
            Log in to see your assigned Corres and knowledge feed.
          </p>

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

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>College email</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-600)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
              Quick Demo Accounts
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDemoAccount('ak@vitstudent.ac.in')}
              >
                Ak (Student)
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDemoAccount('priya@vitstudent.ac.in')}
              >
                Priya (Senior)
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDemoAccount('admin@vitstudent.ac.in')}
              >
                Admin
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 18,
              fontSize: 13.5,
              color: 'var(--text-600)',
            }}
          >
            New here?{' '}
            <a
              onClick={goRegister}
              style={{ color: 'var(--ink-900)', fontWeight: 600, cursor: 'pointer' }}
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;

