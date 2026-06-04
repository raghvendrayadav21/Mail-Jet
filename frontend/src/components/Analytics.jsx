import React, { useState, useEffect } from 'react';
import { getEmailStats } from '../services/api';

const SENTIMENT_COLORS = {
  Urgent: '#f87171',
  Neutral: '#94a3b8',
  Appreciation: '#34d399',
  Disappointment: '#fbbf24',
};

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{sub}</div>}
    </div>
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmailStats()
      .then(setStats)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <span className="btn-spinner" style={{ borderTopColor: 'var(--primary)', width: '28px', height: '28px' }}></span>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>Loading analytics...</p>
    </div>
  );

  if (error) return <div className="error-banner">{error}</div>;
  if (!stats) return null;

  const sentimentData = stats.sentimentBreakdown || {};
  const totalSentiment = Object.values(sentimentData).reduce((a, b) => a + b, 0);
  const dailyData = stats.dailyCounts || {};
  const maxDaily = Math.max(...Object.values(dailyData), 1);

  // Pie chart slices (SVG)
  let offset = 0;
  const radius = 60;
  const cx = 80, cy = 80;
  const circumference = 2 * Math.PI * radius;
  const slices = Object.entries(sentimentData).map(([key, val]) => {
    const pct = totalSentiment > 0 ? val / totalSentiment : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = { key, val, pct, dash, gap, offset, color: SENTIMENT_COLORS[key] };
    offset += dash;
    return slice;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Analytics</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Your email generation insights and trends</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard label="Total Emails Generated" value={stats.total} icon="📧" color="#6366f1" />
        <StatCard label="This Month" value={stats.thisMonth} sub="vs all time" icon="📅" color="#10b981" />
        <StatCard label="Urgent Emails" value={sentimentData.Urgent || 0} icon="🚨" color="#ef4444" />
        <StatCard label="Appreciation" value={sentimentData.Appreciation || 0} icon="🌟" color="#34d399" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Sentiment Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>Sentiment Breakdown</h3>
          {totalSentiment === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                {slices.map(slice => (
                  <circle
                    key={slice.key}
                    cx={cx} cy={cy} r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="28"
                    strokeDasharray={`${slice.dash} ${slice.gap}`}
                    strokeDashoffset={-slice.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all 0.4s ease' }}
                  />
                ))}
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="var(--text-main)" fontSize="18" fontWeight="900">{totalSentiment}</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(sentimentData).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: SENTIMENT_COLORS[key], flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{key}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: 'auto' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: 'var(--text-main)' }}>Last 7 Days Activity</h3>
          {Object.values(dailyData).every(v => v === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No recent activity</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '120px' }}>
              {Object.entries(dailyData).map(([date, count]) => {
                const barH = maxDaily > 0 ? (count / maxDaily) * 100 : 0;
                const label = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
                return (
                  <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{count > 0 ? count : ''}</span>
                    <div style={{ width: '100%', height: `${Math.max(barH, count > 0 ? 6 : 2)}%`, background: count > 0 ? 'linear-gradient(180deg, #6366f1, #818cf8)' : 'rgba(255,255,255,0.06)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', minHeight: '2px' }} />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
