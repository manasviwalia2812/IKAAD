export function Mascot() {
  return (
    <div className="mascotWrap" aria-hidden="true">
      <svg
        className="mascot"
        viewBox="0 0 320 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="gGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(120, 90, 255, 0.65)" />
            <stop offset="55%" stopColor="rgba(120, 90, 255, 0.18)" />
            <stop offset="100%" stopColor="rgba(120, 90, 255, 0)" />
          </radialGradient>
          <linearGradient id="gBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.72)" />
          </linearGradient>
          <linearGradient id="gFace" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(20, 22, 36, 0.95)" />
            <stop offset="100%" stopColor="rgba(15, 18, 32, 0.85)" />
          </linearGradient>
          <radialGradient id="gEye" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(120, 255, 255, 1)" />
            <stop offset="55%" stopColor="rgba(120, 255, 255, 0.75)" />
            <stop offset="100%" stopColor="rgba(120, 255, 255, 0.05)" />
          </radialGradient>
        </defs>

        {/* glow */}
        <circle cx="160" cy="170" r="130" fill="url(#gGlow)" />

        {/* antenna */}
        <path
          d="M160 38 C160 58 160 78 160 96"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="160" cy="34" r="10" fill="rgba(255,255,255,0.85)" />
        <circle cx="160" cy="34" r="20" fill="rgba(120,255,255,0.15)" />

        {/* body */}
        <path
          d="M92 160
             C92 118 122 92 160 92
             C198 92 228 118 228 160
             C228 218 203 254 160 254
             C117 254 92 218 92 160 Z"
          fill="url(#gBody)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />

        {/* face plate */}
        <path
          d="M112 132
             C112 112 132 98 160 98
             C188 98 208 112 208 132
             C208 154 192 170 160 170
             C128 170 112 154 112 132 Z"
          fill="url(#gFace)"
        />

        {/* eyes */}
        <ellipse className="eye" cx="145" cy="132" rx="12" ry="10" fill="url(#gEye)" />
        <ellipse className="eye" cx="175" cy="132" rx="12" ry="10" fill="url(#gEye)" />

        {/* mouth */}
        <path
          d="M144 150 C152 158 168 158 176 150"
          stroke="rgba(120,255,255,0.9)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* hover cards */}
        <g className="chatCards">
          <path
            d="M48 164 C48 150 58 140 72 140 H132 C146 140 156 150 156 164 V188 C156 202 146 212 132 212 H92 L72 226 V212 H72 C58 212 48 202 48 188 Z"
            fill="rgba(95, 214, 255, 0.18)"
            stroke="rgba(95, 214, 255, 0.35)"
          />
          <path
            d="M164 176 C164 162 174 152 188 152 H248 C262 152 272 162 272 176 V202 C272 216 262 226 248 226 H208 L188 240 V226 H188 C174 226 164 216 164 202 Z"
            fill="rgba(255, 145, 250, 0.16)"
            stroke="rgba(255, 145, 250, 0.35)"
          />
          <circle cx="86" cy="168" r="8" fill="rgba(95,214,255,0.55)" />
          <rect x="100" y="162" width="40" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
          <rect x="100" y="174" width="26" height="6" rx="3" fill="rgba(255,255,255,0.25)" />

          <circle cx="202" cy="180" r="8" fill="rgba(255,145,250,0.55)" />
          <rect x="216" y="174" width="40" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
          <rect x="216" y="186" width="28" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
        </g>
      </svg>
    </div>
  );
}

