import React, { useState, useEffect } from 'react';
import Icon from '../common/Icon';
import { Avatar, AssignmentBadge } from '../common/CommonUI';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import SeniorJuniorMentoringIllustration from '../common/SeniorJuniorMentoringIllustration';

export function OnboardingScreen({ onDone, goLogin }) {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const steps = ['Account Details', 'Email Confirmation', 'Academic Profile', 'Corres Match'];

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Academic Profile state
  const [college, setCollege] = useState('');
  const [program, setProgram] = useState('');
  const [branch, setBranch] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignmentResult, setAssignmentResult] = useState(null);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Client-side institutional email parser
  const autoExtractFromEmail = (rawEmail) => {
    const lower = rawEmail.toLowerCase().trim();
    if (lower.endsWith('@celestia-trichy.me')) {
      const prefix = lower.split('@')[0];
      const match = prefix.match(/^(\d{2})([a-z]+)(\d+)$/);
      if (match) {
        setCollege('Celestia Institute of Technology');
        setProgram(match[2].toUpperCase());
        setBranch(match[2].toUpperCase() === 'MCA' ? 'Computer Applications' : 'Engineering');
        setBatchYear((2000 + parseInt(match[1], 10)).toString());
        setRollNumber(parseInt(match[3], 10).toString());
      }
    } else if (lower.endsWith('@nitt.edu')) {
      setCollege('National Institute of Technology, Trichy');
      const prefix = lower.split('@')[0];
      // NIT Trichy format: 4-digit dept + 2-digit year + 3-digit roll (e.g. 205126009)
      const match = prefix.match(/^(\d{4})(\d{2})(\d{3})$/);
      if (match) {
        const dept = match[1];
        const yr = 2000 + parseInt(match[2], 10);
        const roll = parseInt(match[3], 10);
        if (dept === '2051') {
          setProgram('MCA');
          setBranch('Computer Applications');
        } else if (dept === '1061') {
          setProgram('B.Tech');
          setBranch('Computer Science & Engineering');
        } else {
          setProgram('B.Tech');
          setBranch('Engineering');
        }
        setBatchYear(yr.toString());
        setRollNumber(roll.toString());
      }
    } else if (lower.endsWith('@vit.ac.in')) {
      setCollege('VIT Vellore');
      const prefix = lower.split('@')[0];
      const match = prefix.match(/^(\d{2})([a-z]+)(\d+)$/);
      if (match) {
        setProgram(match[2].toUpperCase());
        setBranch(match[2].toUpperCase() === 'MCA' ? 'Computer Applications' : 'Computer Science');
        setBatchYear((2000 + parseInt(match[1], 10)).toString());
        setRollNumber(parseInt(match[3], 10).toString());
      }
    }
  };

  // Step 0 -> Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    const lower = email.toLowerCase().trim();
    if (lower.includes('@gmail.com') || lower.includes('@gmail.')) {
      setError('Personal email providers (@gmail.com) are strictly not accepted. Please use your institutional college email (@nitt.edu, @vit.ac.in).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authApi.sendOtp({
        email: lower,
        name: name.trim(),
        purpose: 'REGISTER',
      });

      if (res.data?.devOtp) {
        setDevOtpHint(res.data.devOtp);
      }
      setResendTimer(45);
      autoExtractFromEmail(lower);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 -> Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit confirmation code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.verifyOtp({
        email: email.toLowerCase().trim(),
        code: otp.trim(),
        purpose: 'REGISTER',
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired confirmation code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Complete Registration & Assign Corres
  const handleAcademicProfileSubmit = async (e) => {
    e?.preventDefault();
    if (!batchYear || !rollNumber) {
      setError('Batch year and roll number are required for Corres pairing.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const registeredUser = await register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        college: college || 'Institutional Campus',
        program: program || 'MCA',
        branch: branch || 'Computer Applications',
        batch: parseInt(batchYear, 10),
        rollNumber: parseInt(rollNumber, 10),
        role: 'STUDENT',
        otp: otp.trim(),
      });

      setAssignmentResult(
        registeredUser?.corres || {
          name: 'Priya Menon',
          batch: parseInt(batchYear, 10) - 1,
          roll: parseInt(rollNumber, 10),
          type: 'SAME_ROLL',
        }
      );

      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Left Visual Stepper Column */}
      <div className="auth-visual">
        <div>
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}
            onClick={() => (goLogin ? goLogin() : (window.location.href = '/'))}
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
              Student Onboarding
            </span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 28, lineHeight: 1.25, fontWeight: 700, marginBottom: 10 }}>
            Preserving knowledge across generations.
          </h1>

          <p style={{ color: '#C8D3E0', fontSize: 14, lineHeight: 1.5, maxWidth: 420, marginBottom: 20 }}>
            Join your institutional cohort to inherit the notes, study plans, and exam wisdom of your predecessors.
          </p>

          {/* Stepper Progression */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: i <= step ? '#fff' : '#647587',
                  transition: 'color 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: '1.5px solid currentColor',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    flexShrink: 0,
                    background: i < step ? 'var(--brass-500)' : i === step ? 'rgba(255, 196, 0, 0.2)' : 'transparent',
                    borderColor: i <= step ? 'var(--brass-500)' : 'currentColor',
                    color: i < step ? '#000' : i === step ? 'var(--brass-500)' : 'inherit',
                    fontWeight: 700,
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: i === step ? 700 : 500 }}>{s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scaled Mentoring Illustration */}
        <div style={{ margin: '14px 0', textAlign: 'center' }}>
          <SeniorJuniorMentoringIllustration className="w-full max-w-xs mx-auto" />
        </div>

        <div style={{ color: '#889AA0', fontSize: 11.5 }}>
          Authorized Domains: @nitt.edu · @vit.ac.in · @celestia-trichy.me
        </div>
      </div>

      {/* Right Form Column */}
      <div className="auth-form-side">
        <div className="auth-box">
          {error && (
            <div
              style={{
                background: 'var(--rust-100)',
                color: 'var(--rust-500)',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 18,
                border: '1px solid rgba(211, 47, 47, 0.2)',
                lineHeight: 1.5,
              }}
            >
              <b>Notice:</b> {error}
            </div>
          )}

          {/* STEP 0: Account Details */}
          {step === 0 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 6 }}>
                  Create your account
                </h2>
                <p className="subhead" style={{ fontSize: 14 }}>
                  Enter your academic details to receive your email confirmation code.
                </p>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 6, display: 'block' }}>
                    Full Name
                  </label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    required
                  />
                </div>

                <div className="field" style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 6, display: 'block' }}>
                    Institutional College Email
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="e.g. 205126009@nitt.edu or 26mca0010@celestia-trichy.me"
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: 4, display: 'block' }}>
                    Allowed: @nitt.edu, @vit.ac.in, @celestia-trichy.me. @gmail is not accepted.
                  </span>
                </div>

                <div className="field" style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 6, display: 'block' }}>
                    Password
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
                  disabled={loading}
                >
                  {loading ? 'Sending verification code…' : 'Send Confirmation Code →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--slate-500)' }}>
                Already have an account?{' '}
                <a onClick={goLogin} style={{ color: 'var(--ink-900)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                  Log in
                </a>
              </div>
            </>
          )}

          {/* STEP 1: Email Confirmation (OTP) */}
          {step === 1 && (
            <>
              <button
                type="button"
                className="back-nav-btn"
                onClick={() => {
                  setError('');
                  setStep(0);
                }}
              >
                ← Back to Account Details
              </button>

              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 6 }}>
                  Verify your email
                </h2>
                <p className="subhead" style={{ fontSize: 14 }}>
                  We sent a 6-digit confirmation code to <strong>{email}</strong>.
                </p>
              </div>

              {devOtpHint && (
                <div
                  style={{
                    background: 'var(--brass-100)',
                    border: '1px solid var(--brass-500)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    color: 'var(--ink-900)',
                    marginBottom: 16,
                  }}
                >
                  💡 <b>Testing Mode:</b> Your confirmation code is <b>{devOtpHint}</b> (also logged to terminal).
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div className="field" style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 6, display: 'block', textAlign: 'center' }}>
                    Enter 6-Digit Code
                  </label>
                  <input
                    className="input"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{
                      fontSize: 28,
                      textAlign: 'center',
                      letterSpacing: 8,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '10px',
                    }}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
                  disabled={loading}
                >
                  {loading ? 'Verifying…' : 'Verify Email →'}
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, fontSize: 12.5, color: 'var(--slate-500)' }}>
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendTimer > 0 ? 'var(--slate-500)' : 'var(--ink-900)',
                    fontWeight: 700,
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    padding: 0,
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Academic Profile Confirmation */}
          {step === 2 && (
            <>
              <button
                type="button"
                className="back-nav-btn"
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
              >
                ← Back to Verification
              </button>

              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 6 }}>
                  Academic profile
                </h2>
                <p className="subhead" style={{ fontSize: 14 }}>
                  Auto-extracted from your verified email. This determines your Corres senior match.
                </p>
              </div>

              <form onSubmit={handleAcademicProfileSubmit}>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 4, display: 'block' }}>
                    Institution
                  </label>
                  <input
                    className="input"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. NIT Trichy or VIT Vellore"
                    required
                  />
                </div>

                <div className="grid grid-2" style={{ gap: 10, marginBottom: 12 }}>
                  <div className="field">
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 4, display: 'block' }}>
                      Program
                    </label>
                    <input
                      className="input"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      placeholder="e.g. MCA, B.Tech"
                      required
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 4, display: 'block' }}>
                      Branch
                    </label>
                    <input
                      className="input"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Applications"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 10, marginBottom: 18 }}>
                  <div className="field">
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 4, display: 'block' }}>
                      Batch Year
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value)}
                      placeholder="e.g. 2026"
                      required
                    />
                  </div>
                  <div className="field">
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-900)', marginBottom: 4, display: 'block' }}>
                      Roll Number
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 9"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
                  disabled={loading}
                >
                  {loading ? 'Finding your Corres senior…' : 'Find My Corres Match →'}
                </button>
              </form>
            </>
          )}

          {/* STEP 3: Corres Matched Celebration */}
          {step === 3 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
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
                    margin: '0 auto 12px',
                    fontSize: 24,
                  }}
                >
                  🎉
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4 }}>
                  Corres Assigned!
                </h2>
                <p className="subhead" style={{ fontSize: 14 }}>
                  Matched batch {batchYear} / roll {rollNumber} with batch {parseInt(batchYear, 10) - 1}.
                </p>
              </div>

              <div
                className="card"
                style={{
                  borderLeft: '4px solid var(--brass-500)',
                  background: 'var(--paper-100)',
                  padding: '16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
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
                    size={52}
                    tone="var(--ink-900)"
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink-900)' }}>
                      {assignmentResult?.name || 'Priya Menon'}
                    </div>
                    <div className="subhead" style={{ marginTop: 2, fontSize: 13 }}>
                      Batch {assignmentResult?.batch || parseInt(batchYear, 10) - 1} · Roll{' '}
                      {assignmentResult?.roll || rollNumber}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <AssignmentBadge type={assignmentResult?.type || 'SAME_ROLL'} />
                </div>

                <p style={{ marginTop: 10, fontSize: 13, color: 'var(--slate-500)', lineHeight: 1.5 }}>
                  {assignmentResult?.type === 'FALLBACK_TOP_PERFORMER'
                    ? 'No senior with your exact roll number was found. A top-performing senior from the previous batch has been paired as your Corres.'
                    : 'Same roll number found in the previous batch — they are now your generational Corres for the rest of your program.'}
                </p>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
                onClick={onDone}
              >
                Enter My Dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingScreen;
