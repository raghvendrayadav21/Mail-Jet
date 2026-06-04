import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { connectGmailReal } from '../services/api';
import Logo from './Logo';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code was returned from Google. Please try again.');
      return;
    }

    const exchangeCode = async () => {
      try {
        await connectGmailReal(code);
        setStatus('success');
        
        // Wait a short moment for the user to celebrate, then navigate back
        setTimeout(() => {
          navigate('/'); // Redirect to dashboard / landing (will auto-route to dashboard if logged in)
        }, 2200);
      } catch (err) {
        console.error('OAuth exchange error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'An error occurred during the secure handshake.');
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, #0f172a, #020617)',
      color: '#f8fafc',
      fontFamily: '"Outfit", sans-serif',
      padding: '2rem',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '3rem 2rem',
        borderRadius: '24px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-15%',
          width: '130%',
          height: '130%',
          background: status === 'success' 
            ? 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 60%)' 
            : status === 'error'
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}></div>

        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Logo size={44} showText={true} />
        </div>

        {status === 'processing' && (
          <div>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
              {/* Spinning outer ring */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '4px solid rgba(99, 102, 241, 0.1)',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite',
              }}></div>
              {/* Inner pulsed circle */}
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '60%',
                height: '60%',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ animation: 'pulse 1.8s ease-in-out infinite' }}>
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Securing Gmail Handshake
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              Verifying credentials and exchanging tokens with Google APIs. Please do not close or refresh this page.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{ transform: 'scale(1)', transition: 'all 0.3s' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em', color: '#22c55e' }}>
              Gmail Linked Successfully!
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              Real-time synchronization established. Taking you back to your workspace...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em', color: '#ef4444' }}>
              Connection Failed
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#f87171', margin: '0 0 2rem 0', lineHeight: 1.5, wordBreak: 'break-word', padding: '0 0.5rem' }}>
              {errorMsg}
            </p>
            
            <button 
              onClick={() => navigate('/')} 
              className="btn" 
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: '12px',
                width: '100%',
                maxWidth: '220px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
              }}
            >
              Return to App
            </button>
          </div>
        )}
      </div>

      {/* Embedded styles for animation support */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
