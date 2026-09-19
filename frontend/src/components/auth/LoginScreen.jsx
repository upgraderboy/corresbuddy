import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SeniorJuniorMentoringIllustration from '../common/SeniorJuniorMentoringIllustration';
import Icon from '../common/Icon';

export function LoginScreen({ onLogin, goRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('26mca0010@celestia-trichy.me');
  const [password, setPassword] = useState('Temp@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    const lower = email.toLowerCase().trim();
    if (lower.includes('@gmail.com') || lower.includes('@gmail.')) {
      setError('Personal email providers (@gmail.com) are strictly not accepted. Please use your verified institutional email (@nitt.edu, @vit.ac.in).');
      return;
    }

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

  const setDemoAccount = (demoEmail, demoPass = 'Temp@1234') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-shell">
      {/* Left Visual Column */}
      <div className="auth-visual">
        <div>
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}
            onClick={() => (window.location.href = '/')}
          >
            <div className="brand-mark">C</div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 700, color: '#fff' }}>
              CorresBuddy
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 196, 0, 0.18)',
                color: 'var(--brass-500)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Academic Knowledge Network
            </span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 30, lineHeight: 1.25, fontWeight: 700, marginBottom: 12 }}>
            What one generation learns should not be lost when it graduates.
          </h1>

          <p style={{ color: '#C8D3E0', fontSize: 14.5, lineHeight: 1.6, maxWidth: 440, marginBottom: 16 }}>
            Every incoming student is automatically matched with the senior who sat in their exact seat —
            same roll number, preceding batch — so institutional wisdom is never lost.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            <span className="feature-pill">🎯 Same-Roll Pairing</span>
            <span className="feature-pill">📚 Preserved Archives</span>
            <span className="feature-pill">💬 Senior Mentorship</span>
          </div>
        </div>

        {/* Mentoring Illustration */}
        <div style={{ margin: '8px 0', textAlign: 'center' }}>
          <SeniorJuniorMentoringIllustration className="w-full max-w-xs mx-auto" />
        </div>

        {/* Lineage & Institution Footer */}
        <div>
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px 14px', borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--brass-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              Active Lineage Preview
            </div>
            <div className="gen-line">
              <span className="gen-dot" /> 2026 · Roll 10 · Student (You)
            </div>
            <div className="gen-line">
              <span className="gen-dot" /> 2025 · Roll 10 · Senior Corres
            </div>
            <div className="gen-line">
              <span className="gen-dot" /> 2024 · Roll 10 · Alumni Corres
            </div>
          </div>

          <div style={{ color: '#889AA0', fontSize: 11.5 }}>
            Authorized Institutions: NIT Trichy (@nitt.edu) · VIT Vellore (@vit.ac.in)
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="auth-form-side">
        <div className="auth-box">
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 6 }}>
              Welcome back
            </h2>
            <p className="subhead" style={{ fontSize: 14 }}>
              Sign in with your institutional email to access your Corres and materials.
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--rust-100)',
                color: 'var(--rust-500)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
                border: '1px solid rgba(211, 47, 47, 0.2)',
                lineHeight: 1.5,
              }}
            >
              <b>Sign-in error:</b> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 6, display: 'block' }}>
                College Email Address
              </label>
              <input
                className="input"
                type="email"
                required
                placeholder="e.g. 26mca0010@celestia-trichy.me or roll@nitt.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: 14 }}
              />
              <span style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 4, display: 'block' }}>
                Must be an institutional address (@nitt.edu, @vit.ac.in). @gmail is not accepted.
              </span>
            </div>

            <div className="field" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', fontSize: 11.5, color: 'var(--slate-500)', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: 14 }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in to CorresBuddy'}
            </button>
          </form>

          {/* Quick Demo Logins with clear card layout */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--slate-500)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Testing Accounts (Password: Temp@1234)
            </div>
            <div className="demo-acc-grid">
              <button
                type="button"
                className="demo-acc-card"
                onClick={() => setDemoAccount('26mca0010@celestia-trichy.me')}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>Student</span>
                <span style={{ fontSize: 10.5, color: 'var(--slate-500)' }}>MCA '26</span>
              </button>

              <button
                type="button"
                className="demo-acc-card"
                onClick={() => setDemoAccount('25mca0010@celestia-trichy.me')}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-900)' }}>Senior</span>
                <span style={{ fontSize: 10.5, color: 'var(--slate-500)' }}>MCA '25</span>
              </button>

              <button
                type="button"
                className="demo-acc-card"
                onClick={() => setDemoAccount('admin@celestia-trichy.me')}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brass-600)' }}>Admin</span>
                <span style={{ fontSize: 10.5, color: 'var(--slate-500)' }}>Campus</span>
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 22,
              fontSize: 13.5,
              color: 'var(--slate-500)',
            }}
          >
            Don't have an account?{' '}
            <a
              onClick={goRegister}
              style={{ color: 'var(--ink-900)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
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
