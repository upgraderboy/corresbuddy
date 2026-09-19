import React, { useState } from 'react';
import Icon from '../common/Icon';
import { Avatar, AssignmentBadge } from '../common/CommonUI';
import { useAuth } from '../../context/AuthContext';

export function OnboardingScreen({ onDone, goLogin }) {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const steps = ['Account', 'Academic profile', 'Corres assignment'];

  // Form state
  const [name, setName] = useState('Ak');
  const [email, setEmail] = useState('newstudent@vitstudent.ac.in');
  const [password, setPassword] = useState('password');
  const [college, setCollege] = useState('VIT Vellore');
  const [program, setProgram] = useState('MCA');
  const [branch, setBranch] = useState('Computer Applications');
  const [batchYear, setBatchYear] = useState('2026');
  const [rollNumber, setRollNumber] = useState('09');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignmentResult, setAssignmentResult] = useState(null);

  const handleCreateAccount = () => {
    if (!name || !email || !password) {
      setError('Please fill in all account fields');
      return;
    }
    setError('');
    setStep(1);
  };

  const handleAcademicProfileSubmit = async () => {
    if (!batchYear || !rollNumber) {
      setError('Batch year and roll number are required for Corres assignment');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const registeredUser = await register({
        name,
        email,
        password,
        college,
        program,
        branch,
        batch: parseInt(batchYear, 10),
        rollNumber: parseInt(rollNumber, 10),
        role: 'STUDENT',
      });

      setAssignmentResult(registeredUser?.corres || {
        name: 'Priya Menon',
        batch: 2025,
        roll: parseInt(rollNumber, 10),
        type: 'SAME_ROLL',
      });

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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

        <div>
          {steps.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                color: i <= step ? '#fff' : '#647587',
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: '1.5px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  background: i < step ? 'var(--brass-500)' : 'transparent',
                  borderColor: i < step ? 'var(--brass-500)' : 'currentColor',
                }}
              >
                {i < step ? (
                  <Icon name="check2" style={{ width: 13, height: 13 }} />
                ) : (
                  i + 1
                )}
              </div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ color: '#7C8AA0', fontSize: 12.5 }}>
          Step {step + 1} of {steps.length}
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
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

          {step === 0 && (
            <>
              <h2 style={{ fontSize: 24, marginBottom: 6 }}>Create your account</h2>
              <p className="subhead" style={{ marginBottom: 22 }}>
                Use your college email to get verified faster.
              </p>
              <div className="field">
                <label>Full name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ak"
                />
              </div>
              <div className="field">
                <label>College email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCreateAccount}
              >
                Continue
              </button>

              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-600)' }}>
                Already have an account?{' '}
                <a onClick={goLogin} style={{ color: 'var(--ink-900)', fontWeight: 600, cursor: 'pointer' }}>
                  Log in
                </a>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontSize: 24, marginBottom: 6 }}>Academic profile</h2>
              <p className="subhead" style={{ marginBottom: 22 }}>
                This determines your automatic Corres match.
              </p>
              <div className="field">
                <label>College</label>
                <input
                  className="input"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label>Program</label>
                  <input
                    className="input"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Branch</label>
                  <input
                    className="input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label>Batch year</label>
                  <input
                    className="input"
                    type="number"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Roll number</label>
                  <input
                    className="input"
                    type="number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAcademicProfileSubmit}
                disabled={loading}
              >
                {loading ? 'Matching Corres…' : 'Find My Corres'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: 24, marginBottom: 6 }}>Corres assigned</h2>
              <p className="subhead" style={{ marginBottom: 20 }}>
                We matched batch {batchYear} / roll {rollNumber} against batch {parseInt(batchYear, 10) - 1}.
              </p>
              <div
                className="card"
                style={{ borderLeft: '4px solid var(--sage-500)', marginBottom: 18 }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar
                    initials={
                      assignmentResult?.name
                        ? assignmentResult.name
                            .split(' ')
                            .map((s) => s[0])
                            .join('')
                            .slice(0, 2)
                        : 'PM'
                    }
                    size={48}
                    tone="var(--ink-900)"
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {assignmentResult?.name || 'Priya Menon'}
                    </div>
                    <div className="subhead" style={{ marginTop: 2 }}>
                      Batch {assignmentResult?.batch || parseInt(batchYear, 10) - 1} · Roll{' '}
                      {assignmentResult?.roll || rollNumber}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <AssignmentBadge type={assignmentResult?.type || 'SAME_ROLL'} />
                </div>
                <p style={{ marginTop: 10, fontSize: 13.5, color: 'var(--text-600)' }}>
                  {assignmentResult?.type === 'FALLBACK_TOP_PERFORMER'
                    ? 'No senior with your exact roll number was found. A top-performing senior has been assigned as your Corres.'
                    : 'Same roll number found in the previous batch — they are now your Corres for the rest of your program.'}
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={onDone}
              >
                Go to my dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingScreen;

