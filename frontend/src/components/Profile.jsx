import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';

const ACCOUNT_TYPES = ['Personal Use', 'Business Use', 'Other'];

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [accountType, setAccountType] = useState(user?.accountType || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const initials = user?.fullName ? user.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    setProfileError('');
    try {
      const updated = await updateProfile(fullName, accountType);
      updateUser(updated);
      setProfileMsg('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match.'); return; }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>My Profile</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Manage your account details and security</p>
      </div>

      {/* Avatar + Info Card */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{user?.email}</div>
            <div style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '6px', background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', fontWeight: 700, display: 'inline-block', marginTop: '0.35rem' }}>{user?.accountType}</div>
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="btn-secondary" style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              ✏️ Edit
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editMode && (
          <form onSubmit={handleProfileSave} style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Full Name</label>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Account Type</label>
              <select
                value={accountType} onChange={e => setAccountType(e.target.value)}
                style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
              >
                {ACCOUNT_TYPES.map(t => <option key={t} value={t} style={{ background: '#1e1e2e' }}>{t}</option>)}
              </select>
            </div>
            {profileMsg && <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>✓ {profileMsg}</div>}
            {profileError && <div style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 600 }}>⚠ {profileError}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn" disabled={profileSaving} style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem' }}>
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setEditMode(false); setFullName(user?.fullName || ''); setAccountType(user?.accountType || ''); }} style={{ padding: '0.6rem 1.1rem', fontSize: '0.82rem' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1.1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔒 Change Password
        </h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '420px' }}>
          {[
            { label: 'Current Password', val: currentPassword, set: setCurrentPassword },
            { label: 'New Password', val: newPassword, set: setNewPassword },
            { label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{label}</label>
              <input
                type="password" value={val} onChange={e => set(e.target.value)} required
                style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '10px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          ))}
          {pwMsg && <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>✓ {pwMsg}</div>}
          {pwError && <div style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 600 }}>⚠ {pwError}</div>}
          <button type="submit" className="btn" disabled={pwSaving} style={{ padding: '0.65rem 1.25rem', fontSize: '0.82rem', width: 'fit-content' }}>
            {pwSaving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
