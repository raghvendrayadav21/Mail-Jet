import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import { generateEmailResponse, getEmailStats } from './services/api';
import ChatBot from './components/ChatBot';
import Logo from './components/Logo';
import OAuthCallback from './components/OAuthCallback';
import History from './components/History';
import Analytics from './components/Analytics';
import Templates from './components/Templates';
import Profile from './components/Profile';

// Dashboard component — tabbed layout with sidebar navigation
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('generate');
  const [emailContent, setEmailContent] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats for usage card
  const [stats, setStats] = useState(null);

  // Tone Sliders
  const [polite, setPolite]   = useState(70);
  const [direct, setDirect]   = useState(50);
  const [concise, setConcise] = useState(40);

  // Edit / Copy state
  const [isEditing, setIsEditing]       = useState(false);
  const [editedResponse, setEditedResponse] = useState('');
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    getEmailStats().then(setStats).catch(() => {});
  }, []);

  const handleGenerateResponse = async (e) => {
    e.preventDefault();
    if (!emailContent.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedResponse('');
    setIsEditing(false);

    const politeVal  = polite  > 65 ? 'highly formal, respectful, and polite'    : polite  < 35 ? 'friendly, casual, and relaxed'               : 'balanced and polite';
    const directVal  = direct  > 65 ? 'very direct and straight-to-the-point'     : direct  < 35 ? 'conversational, soft, and gentle'             : 'professional and direct';
    const conciseVal = concise > 65 ? 'extremely concise, short, and brief'       : concise < 35 ? 'comprehensive, detailed, and highly explanatory' : 'concise and well-structured';

    const enhancedPrompt = `${emailContent}\n\n[Tone Guideline: Please draft the reply such that it is ${politeVal}, ${directVal}, and ${conciseVal}.]`;

    try {
      const data = await generateEmailResponse(enhancedPrompt, user?.fullName);
      setGeneratedResponse(data.generatedResponse);
      setEditedResponse(data.generatedResponse);
      // Refresh stats after new generation
      getEmailStats().then(setStats).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedResponse : generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setEmailContent('');
    setGeneratedResponse('');
    setEditedResponse('');
    setError(null);
    setIsEditing(false);
  };

  const renderGenerateTab = () => {
    return (
      <>
        {/* Page Title */}
        <div className="dash-title-block" style={{ marginBottom: '1.5rem' }}>
          <h1 className="dash-title" style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Smart Email Assistant</h1>
          <p className="dash-subtitle" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Paste an incoming email, tune the tone, and let AI draft the perfect reply for you.
          </p>
        </div>

        {/* Two-column workspace grid */}
        <div className="dash-workspace" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* LEFT: Input form + Response Card */}
          <div className="dash-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={handleGenerateResponse} className="email-form-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label htmlFor="emailInput" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Incoming Email Content
              </label>
              <textarea
                id="emailInput"
                className="email-textarea"
                placeholder="Paste the email you received here…"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                disabled={isLoading}
                required
                style={{ minHeight: '180px', resize: 'vertical' }}
              />
              <div className="form-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn generate-btn"
                  disabled={isLoading || !emailContent.trim()}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <>
                      <span className="btn-spinner" style={{ marginRight: '0.5rem' }}></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      Generate Response
                    </>
                  )}
                </button>
                {(emailContent || generatedResponse) && (
                  <button type="button" onClick={handleClear} className="btn-secondary clear-btn">
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            {/* Generated Response Output */}
            {!isLoading && generatedResponse && (
              <div className="response-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="response-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
                  <span className="response-card-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Generated Response
                  </span>

                  <div className="response-card-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleCopy} className="icon-action-btn" title="Copy to clipboard" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="icon-action-btn" title="Edit response" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                    ) : (
                      <>
                        <button onClick={() => { setGeneratedResponse(editedResponse); setIsEditing(false); }} className="icon-action-btn save-btn" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Save
                        </button>
                        <button onClick={() => { setEditedResponse(generatedResponse); setIsEditing(false); }} className="icon-action-btn" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="response-card-body">
                  {isEditing ? (
                    <textarea
                      className="response-edit-area"
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      style={{ width: '100%', minHeight: '200px', padding: '0.75rem', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'inherit' }}
                    />
                  ) : (
                    <div className="response-text" style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{generatedResponse}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Tone Control Panel + Usage Card + Tips */}
          <div className="dash-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Stats Card */}
            {stats && (
              <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(99, 102, 241, 0.25)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📈</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage Stats</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', lineHeight: 1.1 }}>
                  {stats.thisMonth} {stats.thisMonth === 1 ? 'email' : 'emails'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  generated by you this month! (All-time total: {stats.total})
                </div>
              </div>
            )}

            {/* Tone Panel */}
            <div className="tone-panel">
              <div className="tone-panel-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Tone Settings
              </div>

              <div className="tone-sliders" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Polite Slider */}
                <div className="tone-slider-row">
                  <div className="tone-slider-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Casual</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Polite ({polite}%)</span>
                    <span>Formal</span>
                  </div>
                  <input type="range" min="0" max="100" value={polite} onChange={(e) => setPolite(Number(e.target.value))} className="range-input" />
                </div>

                {/* Direct Slider */}
                <div className="tone-slider-row">
                  <div className="tone-slider-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Gentle</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Direct ({direct}%)</span>
                    <span>Bold</span>
                  </div>
                  <input type="range" min="0" max="100" value={direct} onChange={(e) => setDirect(Number(e.target.value))} className="range-input" />
                </div>

                {/* Concise Slider */}
                <div className="tone-slider-row">
                  <div className="tone-slider-labels" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Detailed</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Concise ({concise}%)</span>
                    <span>Brief</span>
                  </div>
                  <input type="range" min="0" max="100" value={concise} onChange={(e) => setConcise(Number(e.target.value))} className="range-input" />
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="tips-card" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '1rem', padding: '1.25rem 1.5rem' }}>
              <div className="tips-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Pro Tips
              </div>
              <ul className="tips-list" style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <li>Paste the <strong>full email</strong> including subject for best results</li>
                <li>Use <strong>Formal + Direct</strong> tone for professional business replies</li>
                <li>Use <strong>Casual + Gentle</strong> for friendly follow-ups</li>
                <li>After generating, click <strong>Edit</strong> to tweak before copying</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dash-page">
      {/* Top Header */}
      <header className="dash-header">
        <Link to="/" className="logo-link-brand" style={{ textDecoration: 'none' }}>
          <Logo size={24} showText={true} />
        </Link>

        <div className="dash-header-right">
          <div className="user-pill">
            <div className="avatar-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="user-name">{user?.fullName || 'User'}</span>
            <span className="user-badge">{user?.accountType || 'Personal'}</span>
          </div>
          <Link to="/" className="dash-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          <button onClick={logout} className="btn-secondary dash-logout" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', height: '36px' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '0.4rem' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Log Out
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <aside style={{ width: '240px', background: 'rgba(3, 7, 18, 0.4)', borderRight: '1px solid var(--surface-border)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'generate', label: 'Generate Response', icon: '⚡' },
            { id: 'history', label: 'Email History', icon: '📋' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'templates', label: 'Templates', icon: '✏️' },
            { id: 'profile', label: 'Profile', icon: '👤' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.15rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="dash-main" style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          {activeTab === 'generate' && renderGenerateTab()}
          {activeTab === 'history' && <History />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'templates' && <Templates onUseTemplate={(content) => { setEmailContent(content); setActiveTab('generate'); }} />}
          {activeTab === 'profile' && <Profile />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/oauth2/callback"
          element={
            <ProtectedRoute>
              <OAuthCallback />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;
