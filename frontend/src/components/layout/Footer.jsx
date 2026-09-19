import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div>
        <span>© 2026 <strong>CorresBuddy</strong>. All rights reserved.</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>•</span>
        <span>Empowering Senior-Junior Academic Mentorship</span>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('CorresBuddy Privacy Policy: Your academic records and communications are strictly protected within your institution domain.'); }}>Privacy</a>
        <a href="#terms" onClick={(e) => { e.preventDefault(); alert('CorresBuddy Terms of Service: Academic integrity is paramount. Only share authorized study resources.'); }}>Terms</a>
        <a href="#support" onClick={(e) => { e.preventDefault(); alert('CorresBuddy Support: Contact your departmental Corres Coordinator or email support@corresbuddy.edu'); }}>Help & Support</a>
      </div>
    </footer>
  );
}

