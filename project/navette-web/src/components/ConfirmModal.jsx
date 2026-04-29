import { useEffect } from 'react';

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
        animation: 'toastSlideIn 0.18s ease',
      }}
    >
      <div style={{
        background: 'var(--nc-surface)',
        border: '1px solid var(--nc-line-strong)',
        borderRadius: '16px',
        padding: '28px 28px 24px',
        width: '400px',
        maxWidth: 'calc(100vw - 48px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Warning icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'var(--nc-danger-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nc-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--nc-text)', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--nc-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            style={{ padding: '0 20px' }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
