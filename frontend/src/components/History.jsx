import React, { useState, useEffect } from 'react';
import { getEmailHistory } from '../services/api';

const sentimentColors = {
  Urgent: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  Appreciation: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
  Disappointment: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  Neutral: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
};

const urgencyColors = {
  High: { bg: 'rgba(239,68,68,0.08)', color: '#f87171' },
  Medium: { bg: 'rgba(245,158,11,0.08)', color: '#fbbf24' },
  Low: { bg: 'rgba(16,185,129,0.08)', color: '#34d399' },
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmailHistory()
      .then(setHistory)
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter(item => {
    const matchSearch = !search || item.incomingEmail?.toLowerCase().includes(search.toLowerCase()) || item.generatedResponse?.toLowerCase().includes(search.toLowerCase());
    const matchSentiment = sentimentFilter === 'All' || item.sentiment === sentimentFilter;
    return matchSearch && matchSentiment;
  });

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const snippet = (text, len = 100) => text ? (text.length > len ? text.slice(0, len) + '…' : text) : '—';

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Email History</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>All your previously generated email drafts</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search emails..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--surface-border)',
            borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none',
          }}
        />
        <select
          value={sentimentFilter}
          onChange={e => setSentimentFilter(e.target.value)}
          style={{
            padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--surface-border)', borderRadius: '10px',
            color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer',
          }}
        >
          {['All', 'Urgent', 'Neutral', 'Appreciation', 'Disappointment'].map(s => (
            <option key={s} value={s} style={{ background: '#1e1e2e' }}>{s}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <span className="btn-spinner" style={{ borderTopColor: 'var(--primary)', width: '28px', height: '28px' }}></span>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading history...</p>
        </div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {history.length === 0 ? 'No emails generated yet. Generate your first email!' : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(item => {
            const sc = sentimentColors[item.sentiment] || sentimentColors.Neutral;
            const uc = urgencyColors[item.urgency] || urgencyColors.Medium;
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{ padding: '1.1rem 1.25rem', cursor: 'pointer', transition: 'border 0.2s', border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--surface-border)' }}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                {/* Row 1: date + badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(item.timestamp)}</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {item.sentiment && <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: sc.bg, color: sc.color, fontWeight: 700 }}>{item.sentiment}</span>}
                    {item.urgency && <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: uc.bg, color: uc.color, fontWeight: 600 }}>{item.urgency}</span>}
                  </div>
                </div>
                {/* Row 2: incoming snippet */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.35rem 0', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-main)' }}>Received: </strong>{snippet(item.incomingEmail)}
                </p>
                {/* Row 3: response snippet */}
                {!isExpanded && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--primary)' }}>Draft: </strong>{snippet(item.generatedResponse)}
                  </p>
                )}
                {/* Expanded view */}
                {isExpanded && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>Incoming Email:</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{item.incomingEmail}</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>Generated Draft:</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.generatedResponse}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
