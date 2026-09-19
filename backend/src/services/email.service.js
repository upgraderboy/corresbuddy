import nodemailer from 'nodemailer';

/**
 * Reusable CorresBuddy Email Service
 * Handles welcome / security verification emails and login alerts.
 */

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
};

export const sendWelcomeEmail = async ({ email, name, college, program, batchYear, rollNumber, corresName }) => {
  const from = process.env.EMAIL_FROM || '"CorresBuddy" <no-reply@corresbuddy.edu>';
  const subject = 'Welcome to CorresBuddy — Account Verified';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #DFDBCF; border-radius: 12px; overflow: hidden;">
      <div style="background: #002147; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; color: #FFC400; font-family: Georgia, serif;">CorresBuddy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #EDEBE2;">What one generation learns should not be lost when it graduates.</p>
      </div>
      <div style="padding: 28px 24px; color: #000000; font-size: 14px; line-height: 1.6;">
        <h2 style="font-size: 18px; margin-top: 0; color: #002147;">Welcome, ${name}!</h2>
        <p>Your institutional CorresBuddy account has been registered and verified successfully.</p>
        
        <div style="background: #F6F5F1; border-left: 4px solid #FFC400; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px;"><b>Institution:</b> ${college || 'Institutional Partner'}</p>
          <p style="margin: 0 0 6px;"><b>Program:</b> ${program || 'MCA'}</p>
          <p style="margin: 0 0 6px;"><b>Academic Batch:</b> ${batchYear || '2026'}</p>
          <p style="margin: 0 0 6px;"><b>Roll Number:</b> ${rollNumber || '—'}</p>
          ${corresName ? `<p style="margin: 0;"><b>Assigned Corres (Senior):</b> ${corresName}</p>` : ''}
        </div>

        <p>You can now access your senior mentor, explore curated study materials, participate in Q&A, and browse your generational lineage.</p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #DFDBCF; font-size: 12px; color: #546970;">
          <p style="margin: 0;">Security reminder: CorresBuddy will never ask for your password via email.</p>
          <p style="margin: 4px 0 0;">© 2026 CorresBuddy. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({ from, to: email, subject, html });
      console.log(`[Email] Welcome email sent to ${email}`);
    } else {
      console.log(`[Email (Dev Mock)] Welcome email generated for ${email}:`);
      console.log(` -> Subject: ${subject}`);
      console.log(` -> Corres: ${corresName || 'Pending'}`);
    }
    return { success: true };
  } catch (err) {
    console.error(`[Email Error] Failed to send welcome email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

export const sendLoginNotificationEmail = async ({ email, name, ip = '127.0.0.1', userAgent = 'Web Browser' }) => {
  const from = process.env.EMAIL_FROM || '"CorresBuddy Security" <security@corresbuddy.edu>';
  const subject = 'CorresBuddy Security Alert — New Sign-in';
  const now = new Date().toUTCString();
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #DFDBCF; border-radius: 12px; overflow: hidden;">
      <div style="background: #002147; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; color: #FFC400; font-family: Georgia, serif;">CorresBuddy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #EDEBE2;">Security Notification</p>
      </div>
      <div style="padding: 28px 24px; color: #000000; font-size: 14px; line-height: 1.6;">
        <h2 style="font-size: 18px; margin-top: 0; color: #002147;">Hello, ${name}</h2>
        <p>A new sign-in was detected for your CorresBuddy account <b>${email}</b>.</p>
        
        <div style="background: #F6F5F1; border-left: 4px solid #546970; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px;"><b>Date & Time:</b> ${now}</p>
          <p style="margin: 0 0 6px;"><b>IP Address:</b> ${ip}</p>
          <p style="margin: 0;"><b>Device / Client:</b> ${userAgent}</p>
        </div>

        <p>If this was you, you can safely ignore this email. If you did not sign in recently, please contact your administrator immediately.</p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #DFDBCF; font-size: 12px; color: #546970;">
          <p style="margin: 0;">© 2026 CorresBuddy. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({ from, to: email, subject, html });
      console.log(`[Email] Security login alert sent to ${email}`);
    } else {
      console.log(`[Email (Dev Mock)] Security login alert generated for ${email} at ${now}`);
    }
    return { success: true };
  } catch (err) {
    console.error(`[Email Error] Failed to send login alert to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

export const sendVerificationOtpEmail = async ({ email, name = 'Student', otp, purpose = 'registration' }) => {
  const from = process.env.EMAIL_FROM || '"CorresBuddy Verification" <verify@corresbuddy.edu>';
  const subject = `Your CorresBuddy Verification Code: ${otp}`;
  const actionText = purpose === 'login' ? 'sign in to your account' : 'complete your CorresBuddy registration';
  
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #DFDBCF; border-radius: 12px; overflow: hidden;">
      <div style="background: #002147; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; color: #FFC400; font-family: Georgia, serif;">CorresBuddy</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #EDEBE2;">Email Ownership Verification</p>
      </div>
      <div style="padding: 28px 24px; color: #000000; font-size: 14px; line-height: 1.6;">
        <h2 style="font-size: 18px; margin-top: 0; color: #002147;">Hello ${name || 'Student'},</h2>
        <p>Use the following 6-digit confirmation code to ${actionText}:</p>
        
        <div style="text-align: center; margin: 26px 0;">
          <div style="display: inline-block; background: #FFF8DB; border: 2px dashed #FFC400; border-radius: 10px; padding: 14px 32px; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #002147; font-family: monospace;">
            ${otp}
          </div>
          <p style="margin: 8px 0 0; font-size: 12px; color: #546970;">This code will expire in 10 minutes.</p>
        </div>

        <p>If you did not request this verification code, please ignore this email or contact your departmental administrator.</p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #DFDBCF; font-size: 12px; color: #546970;">
          <p style="margin: 0;">© 2026 CorresBuddy. Preserving Generational Academic Knowledge.</p>
        </div>
      </div>
    </div>
  `;

  // Always log prominently to terminal in development/fallback mode
  console.log(`\n======================================================`);
  console.log(`[EMAIL VERIFICATION OTP] ${email} -> CODE: ${otp}`);
  console.log(`======================================================\n`);

  try {
    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({ from, to: email, subject, html });
      console.log(`[Email] Verification OTP sent to ${email}`);
    }
    return { success: true };
  } catch (err) {
    console.error(`[Email Error] Failed to send OTP email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

export default {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendVerificationOtpEmail,
};


