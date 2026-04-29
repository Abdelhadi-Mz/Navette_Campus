import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Feather-style icons ─── */

const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IconBus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="13" rx="3" />
    <path d="M2 10h20" />
    <circle cx="7.5" cy="18.5" r="1.5" /><circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);

const IconPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconActivity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const LogoBus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="13" rx="3" />
    <path d="M2 10h20" />
    <circle cx="7.5" cy="18.5" r="1.5" /><circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const navLinks = [
  { to: '/',         label: 'Dashboard', icon: <IconGrid />,     exact: true },
  { to: '/shuttles', label: 'Navettes',  icon: <IconBus /> },
  { to: '/stops',    label: 'Arrêts',    icon: <IconPin /> },
  { to: '/trips',    label: 'Tournées',  icon: <IconActivity /> },
  { to: '/map',      label: 'Carte',     icon: <IconMap /> },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('navette-theme');
    return saved !== 'light';
  });

  useEffect(() => {
    const saved = localStorage.getItem('navette-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    setIsDark(saved !== 'light');
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('navette-theme', next);
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (link) =>
    link.exact ? location.pathname === link.to : location.pathname === link.to;

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      width: '360px',
      background: 'var(--nc-sidebar)',
      borderRight: '1px solid var(--nc-sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 24px',
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '40px',
        paddingLeft: '4px',
      }}>
        <div style={{
          width: '52px', height: '52px',
          background: 'var(--nc-brand)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <LogoBus />
        </div>
        <div style={{
          fontFamily: 'var(--nc-font-sans)',
          fontWeight: '800',
          fontSize: '16px',
          letterSpacing: '0.08em',
          lineHeight: 1.3,
          color: 'var(--nc-sidebar-text)',
        }}>
          NAVETTE<br />CAMPUS
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navLinks.map(link => {
          const active = isActive(link);
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '15px 18px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: '500',
                color: active ? 'var(--nc-brand)' : 'var(--nc-sidebar-text-muted)',
                background: active ? 'var(--nc-sidebar-active)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User / theme toggle / logout */}
      <div style={{
        borderTop: '1px solid var(--nc-sidebar-border)',
        paddingTop: '16px',
        marginTop: '8px',
      }}>

        {/* Username row + theme toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingLeft: '6px',
          paddingRight: '4px',
        }}>
          <span style={{
            fontSize: '12px',
            color: 'var(--nc-sidebar-text-dim)',
            fontFamily: 'var(--nc-font-mono)',
            letterSpacing: '0.04em',
          }}>
            {user?.username}
          </span>

          <button
            onClick={toggleTheme}
            title={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
            style={{
              background: 'transparent',
              border: '1px solid var(--nc-sidebar-border)',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: 'var(--nc-sidebar-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s, background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--nc-sidebar-text)';
              e.currentTarget.style.background = 'var(--nc-sidebar-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--nc-sidebar-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
            padding: '14px 18px',
            border: 'none',
            borderRadius: '14px',
            background: 'transparent',
            color: 'var(--nc-sidebar-text-muted)',
            fontSize: '17px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'color 0.15s, background 0.15s',
            fontFamily: 'var(--nc-font-sans)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--nc-sidebar-text)';
            e.currentTarget.style.background = 'var(--nc-sidebar-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--nc-sidebar-text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <IconLogout />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
