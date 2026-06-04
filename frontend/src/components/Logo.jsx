import React from 'react';

const Logo = ({ size = 24, showText = false, subText = false, className = '' }) => {
  return (
    <div className={`mailjet-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          filter: 'drop-shadow(0px 4px 12px rgba(99, 102, 241, 0.25))',
          transform: 'rotate(-10deg)',
          display: 'block'
        }}
      >
        <defs>
          {/* Gradients matching the low-poly paper airplane facets */}
          <linearGradient id="logo-grad-left" x1="15" y1="80" x2="70" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="logo-grad-right" x1="50" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="logo-grad-bolt" x1="45" y1="35" x2="65" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Left Wing Facet */}
        <path
          d="M85 15 L15 55 L50 62 Z"
          fill="url(#logo-grad-left)"
        />

        {/* Right Wing Facet */}
        <path
          d="M85 15 L50 62 L60 85 L78 40 Z"
          fill="url(#logo-grad-right)"
          opacity="0.9"
        />

        {/* Overlay/Cutout Lightning Bolt aligned in the center fold */}
        <path
          d="M82 17 L44 58 L56 58 L38 85 L65 52 L53 52 Z"
          fill="url(#logo-grad-bolt)"
          style={{ filter: 'drop-shadow(0px 2px 6px rgba(59, 130, 246, 0.4))' }}
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, textAlign: 'left' }}>
          <span 
            className="logo-text"
            style={{ 
              fontSize: size * 0.72 + 'px', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              background: 'linear-gradient(to right, #6366f1, #3b82f6, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MailJet
          </span>
          {subText && (
            <span 
              className="logo-subtext"
              style={{ 
                fontSize: size * 0.28 + 'px', 
                color: 'var(--text-muted)', 
                fontWeight: 600,
                letterSpacing: '0.02em',
                marginTop: '1px'
              }}
            >
              AI-Powered Email Assistant
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
