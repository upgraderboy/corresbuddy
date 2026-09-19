import React from 'react';

export default function SeniorJuniorMentoringIllustration({ className = "w-full h-auto max-w-md mx-auto" }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Senior mentoring junior student illustration"
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#002147" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#FFC400" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#002147" />
          <stop offset="100%" stopColor="#00387A" />
        </linearGradient>
        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFC400" />
          <stop offset="100%" stopColor="#E5B000" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#002147" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Background Soft Blob */}
      <path
        d="M60 220C40 130 130 50 240 50C360 50 450 120 440 220C430 320 340 370 230 370C120 370 80 310 60 220Z"
        fill="url(#bgGrad)"
      />

      {/* Desk Surface */}
      <rect x="80" y="310" width="340" height="12" rx="6" fill="#002147" opacity="0.85" />
      <rect x="110" y="322" width="280" height="4" rx="2" fill="#546970" opacity="0.3" />

      {/* Mentor (Senior on Left) */}
      <g id="mentor">
        {/* Mentor Body/Torso */}
        <path d="M125 310V235C125 210 145 190 170 190C195 190 215 210 215 235V310H125Z" fill="url(#primaryGrad)" />
        {/* Mentor Collar & Tie / Details */}
        <path d="M158 190L170 215L182 190" stroke="#FFC400" strokeWidth="3" strokeLinecap="round" />
        {/* Mentor Head */}
        <circle cx="170" cy="150" r="28" fill="#F4D0B5" />
        {/* Mentor Hair */}
        <path d="M142 145C142 125 155 118 170 118C185 118 198 125 198 145C198 148 192 136 170 136C148 136 142 148 142 145Z" fill="#002147" />
        {/* Mentor Arm pointing / guiding */}
        <path d="M195 230L240 255L248 245" stroke="#F4D0B5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        {/* Senior Cap / Knowledge icon floating above */}
        <path d="M150 95L170 85L190 95L170 105L150 95Z" fill="#FFC400" />
        <path d="M170 105V114" stroke="#FFC400" strokeWidth="2" />
        <circle cx="170" cy="116" r="2" fill="#FFC400" />
      </g>

      {/* Shared Laptop on Desk */}
      <g id="laptop" filter="url(#softShadow)">
        <rect x="215" y="240" width="70" height="50" rx="5" fill="#002147" />
        <rect x="221" y="246" width="58" height="38" rx="2" fill="#FFFFFF" />
        {/* Code / Resource lines on screen */}
        <rect x="227" y="254" width="28" height="3" rx="1.5" fill="#FFC400" />
        <rect x="227" y="261" width="44" height="3" rx="1.5" fill="#546970" />
        <rect x="227" y="268" width="36" height="3" rx="1.5" fill="#546970" />
        <rect x="227" y="275" width="20" height="3" rx="1.5" fill="#002147" />
        {/* Laptop Base */}
        <path d="M205 295H295L290 300H210L205 295Z" fill="#546970" />
      </g>

      {/* Mentee (Junior on Right) */}
      <g id="mentee">
        {/* Mentee Body/Torso */}
        <path d="M285 310V245C285 220 305 200 330 200C355 200 375 220 375 245V310H285Z" fill="#546970" />
        {/* Mentee Head */}
        <circle cx="330" cy="160" r="26" fill="#F0C7A6" />
        {/* Mentee Hair */}
        <path d="M304 155C304 135 316 128 330 128C344 128 356 135 356 155C356 158 350 146 330 146C310 146 304 158 304 155Z" fill="#001833" />
        {/* Mentee Arm taking notes */}
        <path d="M310 240L285 270L275 265" stroke="#F0C7A6" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Stack of Reference Books */}
      <g id="books">
        <rect x="375" y="280" width="35" height="8" rx="2" fill="#FFC400" />
        <rect x="370" y="288" width="42" height="10" rx="2" fill="#002147" />
        <rect x="368" y="298" width="46" height="12" rx="2" fill="#546970" />
      </g>

      {/* Floating Connection / Mentorship Sparkles */}
      <g id="sparkles">
        <path d="M250 150L253 158L261 161L253 164L250 172L247 164L239 161L247 158Z" fill="#FFC400" />
        <circle cx="280" cy="140" r="3" fill="#FFC400" opacity="0.8" />
        <circle cx="218" cy="170" r="2.5" fill="#FFC400" opacity="0.7" />
        <path d="M240 185C255 175 270 180 278 190" stroke="#FFC400" strokeWidth="2" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

