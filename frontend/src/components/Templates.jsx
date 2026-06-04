import React, { useState, useEffect } from 'react';
import { getTemplates, createTemplate, deleteTemplate } from '../services/api';

const DEFAULT_TEMPLATES = [
  { name: 'Professional Apology', content: 'Dear [Name],\n\nI sincerely apologize for the inconvenience caused. We take full responsibility and are working to resolve this immediately.\n\nThank you for your patience.\n\nBest regards,' },
  { name: 'Meeting Request', content: 'Dear [Name],\n\nI hope this message finds you well. I would like to schedule a meeting at your earliest convenience to discuss [Topic].\n\nPlease let me know your availability.\n\nBest regards,' },
  { name: 'Thank You Reply', content: 'Dear [Name],\n\nThank you so much for your kind words. It means a great deal to us. We look forward to continuing to serve you.\n\nWarm regards,' },
];

const Templates = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [usedId, setUsedId] = useState(null);

  const loadTemplates = () => {
    setLoading(true);
    getTemplates()
      .then(setTemplates)
      .catch(() => setError('Failed to load templates.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTemplates(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;
    setSaving(true);
    setError('');
    try {
      const created = await createTemplate(newName.trim(), newContent.trim());
      setTemplates(prev => [created, ...prev]);
      setNewName('');
      setNewContent('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUse = (content) => {
    if (onUseTemplate) onUseTemplate(content);
  };

  const TemplateCard = ({ t, isDefault = false }) => (
    <div className="glass-panel" style={{ padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{t.name}</span>
          {isDefault && <span style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', borderRadius: '6px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', fontWeight: 700 }}>Default</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { handleUse(t.content); setUsedId(t.id || t.name); setTimeout(() => setUsedId(null), 1500); }}
            style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            {usedId === (t.id || t.name) ? '✓ Loaded!' : 'Use'}
          </button>
          {!isDefault && (
            <button
              onClick={() => handleDelete(t.id)}
              disabled={deletingId === t.id}
              style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {deletingId === t.id ? '...' : '🗑'}
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
        {t.content.length > 160 ? t.content.slice(0, 160) + '…' : t.content}
      </p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Email Templates</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Save and reuse your email templates with one click</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn" style={{ padding: '0.55rem 1.1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
          {showForm ? '✕ Cancel' : '+ New Template'}
        </button>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Create Form */}
      {showForm && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid rgba(99,102,241,0.3)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Create New Template</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input
              type="text" placeholder="Template name (e.g. Follow-up Email)"
              value={newName} onChange={e => setNewName(e.target.value)} required
              style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
            />
            <textarea
              placeholder="Email template content..."
              value={newContent} onChange={e => setNewContent(e.target.value)} required rows={5}
              style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn" disabled={saving} style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem' }}>
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Default Templates */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Starter Templates</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {DEFAULT_TEMPLATES.map(t => <TemplateCard key={t.name} t={t} isDefault />)}
        </div>
      </div>

      {/* User Templates */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <span className="btn-spinner" style={{ borderTopColor: 'var(--primary)' }}></span>
        </div>
      ) : templates.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Your Templates ({templates.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {templates.map(t => <TemplateCard key={t.id} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
