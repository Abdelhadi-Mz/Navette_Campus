import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

const ICONS = {
  success: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const TYPE_STYLES = {
  success: { accent: '#3DD68C', bg: 'rgba(61,214,140,0.15)' },
  error:   { accent: '#E5484D', bg: 'rgba(229,72,77,0.15)' },
  info:    { accent: '#4DA6FF', bg: 'rgba(77,166,255,0.15)' },
};

const ToastItem = ({ toast, onRemove }) => {
  const { accent, bg } = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      background: '#1a1d22',
      border: `1px solid ${accent}40`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      minWidth: '280px',
      maxWidth: '380px',
      animation: 'toastSlideIn 0.22s ease',
    }}>
      <span style={{ color: accent, flexShrink: 0, display: 'flex' }}>{ICONS[toast.type]}</span>
      <span style={{ flex: 1, fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.92)', lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', padding: '2px', flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div style={{
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{ pointerEvents: 'all' }}>
        <ToastItem toast={t} onRemove={onRemove} />
      </div>
    ))}
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const toast = {
    success: (msg) => add(msg, 'success'),
    error:   (msg) => add(msg, 'error'),
    info:    (msg) => add(msg, 'info'),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);
