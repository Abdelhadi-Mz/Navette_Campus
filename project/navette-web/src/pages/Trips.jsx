import { useState, useEffect } from 'react';
import api from '../api/axios';

const ROUTE_COLORS = ['#E5484D', '#F5A623', '#3DD68C', '#4DA6FF', '#B07CF5'];
const AVATAR_COLORS = ['#E5484D', '#F5A623', '#3DD68C', '#4DA6FF', '#B07CF5'];

/* ─── Icons ─── */
const IconActivity = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconClock = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconPause = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);
const IconFlag = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const IconSearch = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBus = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="13" rx="3" /><path d="M2 10h20" />
    <circle cx="7.5" cy="18.5" r="1.5" /><circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);
const IconAlert = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconDownload = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ─── Sort icon ─── */
const SortIcon = ({ active, dir }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: active ? 1 : 0.28, marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}>
    {active && dir === 'desc'
      ? <polyline points="6 9 12 15 18 9" />
      : <polyline points="18 15 12 9 6 15" />
    }
  </svg>
);

/* ─── Helpers ─── */
const formatDuration = (started, ended) => {
  const diff = Math.floor((new Date(ended || Date.now()) - new Date(started)) / 60000);
  if (diff < 1) return '< 1 min';
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const formatTime = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const tripColor = (id) => ROUTE_COLORS[(id ?? 0) % ROUTE_COLORS.length];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const initials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
};

/* ─── Sub-components ─── */
const DriverAvatar = ({ name }) => {
  const color = avatarColor(name);
  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%',
      background: `${color}22`, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: '700', color, flexShrink: 0, letterSpacing: '0.04em',
    }}>
      {initials(name)}
    </div>
  );
};

const DelayBadge = ({ minutes }) => {
  if (!minutes || minutes <= 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--nc-success)', fontSize: '12px', fontWeight: '500' }}>
        <IconCheck color="#3DD68C" size={12} /> À l'heure
      </span>
    );
  }
  const severe = minutes >= 10;
  const color = severe ? '#E5484D' : '#F5A623';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 8px', borderRadius: '20px',
      background: severe ? 'rgba(229,72,77,0.1)' : 'rgba(245,166,35,0.1)',
      color, fontSize: '11.5px', fontWeight: '600',
    }}>
      <IconAlert color={color} size={11} /> +{minutes} min
    </span>
  );
};

const DurationPill = ({ started, ended, status }) => {
  const dur = formatDuration(started, ended);
  const live = status === 'active' || status === 'pause';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 8px', borderRadius: '20px',
      background: live ? 'rgba(77,166,255,0.1)' : 'rgba(255,255,255,0.05)',
      color: live ? '#4DA6FF' : 'var(--nc-text-dim)',
      fontSize: '12px', fontWeight: '500', fontFamily: 'var(--nc-font-mono)',
    }}>
      <IconClock color={live ? '#4DA6FF' : 'var(--nc-text-dim)'} size={11} /> {dur}
    </span>
  );
};

/* ─── CSV export ─── */
const exportCSV = (rows) => {
  const headers = ['ID', 'Navette', 'Chauffeur', 'Statut', 'Départ', 'Arrivée', 'Durée (min)', 'Retard (min)', 'Notes'];
  const data = rows.map(t => [
    t.id,
    t.shuttle_name,
    t.driver_name,
    t.status,
    t.started_at ? new Date(t.started_at).toLocaleString('fr-FR') : '',
    t.ended_at   ? new Date(t.ended_at).toLocaleString('fr-FR')   : '',
    t.started_at ? Math.floor((new Date(t.ended_at || Date.now()) - new Date(t.started_at)) / 60000) : '',
    t.delay_minutes || 0,
    t.notes || '',
  ]);
  const csv = [headers, ...data]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tournees_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── Page ─── */
const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortKey, setSortKey] = useState('started_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data);
    } catch {
      setError('Impossible de charger les tournées.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  /* Date range boundaries */
  const now = new Date();
  const dateStart = {
    today: new Date(now.toDateString()),
    week:  new Date(now - 7 * 24 * 60 * 60 * 1000),
    month: new Date(now - 30 * 24 * 60 * 60 * 1000),
    all:   null,
  }[dateFilter];

  const filtered = trips.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      t.shuttle_name?.toLowerCase().includes(q) ||
      t.driver_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchDate = !dateStart || new Date(t.started_at) >= dateStart;
    return matchSearch && matchStatus && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total    = trips.length;
  const active   = trips.filter(t => t.status === 'active').length;
  const paused   = trips.filter(t => t.status === 'pause').length;
  const finished = trips.filter(t => t.status === 'finished').length;
  const delayed  = trips.filter(t => t.delay_minutes > 0).length;
  const onTimeRate = total > 0 ? Math.round(((total - delayed) / total) * 100) : 100;

  const statCards = [
    { value: total,            label: 'Total tournées',  iconBg: 'rgba(229,72,77,0.14)',   iconColor: '#E5484D', Icon: IconActivity },
    { value: active,           label: 'En cours',        iconBg: 'rgba(61,214,140,0.14)',  iconColor: '#3DD68C', Icon: IconBus },
    { value: paused,           label: 'En pause',        iconBg: 'rgba(245,166,35,0.16)',  iconColor: '#F5A623', Icon: IconPause },
    { value: finished,         label: 'Terminées',       iconBg: 'rgba(77,166,255,0.14)',  iconColor: '#4DA6FF', Icon: IconFlag },
    { value: `${onTimeRate}%`, label: 'Ponctualité',     iconBg: 'rgba(61,214,140,0.14)',  iconColor: '#3DD68C', Icon: IconClock },
  ];

  const statusLabel = { active: 'En cours', pause: 'En pause', finished: 'Terminée' };
  const statusBadge = { active: 'badge-active', pause: 'badge-pause', finished: 'badge-finished' };
  const thStyle = (key) => ({ cursor: 'pointer', userSelect: 'none', color: sortKey === key ? 'var(--nc-text)' : undefined });

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--nc-text-muted)' }}>Chargement...</div>
  );

  return (
    <div className="container" style={{ marginTop: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--nc-text)', marginBottom: '4px' }}>
            Tournées
          </h2>
          <p style={{ color: 'var(--nc-text-dim)', fontSize: '13px' }}>
            Historique et suivi des tournées en temps réel
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)', letterSpacing: '0.06em', marginTop: '6px' }}>
          Auto-refresh toutes les 10s
        </span>
      </div>

      {error && (
        <div style={{ background: 'var(--nc-danger-soft)', border: '1px solid rgba(229,72,77,0.3)', color: 'var(--nc-danger)', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* 5 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {statCards.map(({ value, label, iconBg, iconColor, Icon }) => (
          <div key={label} className="card" style={{ padding: '18px 16px', marginBottom: 0 }}>
            <div className="stat-icon" style={{ background: iconBg, marginBottom: '10px' }}>
              <Icon color={iconColor} size={16} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--nc-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '11.5px', fontWeight: '500', color: 'var(--nc-text-muted)', marginTop: '5px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 240px' }}>
          <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <IconSearch color="var(--nc-text-dim)" size={14} />
          </div>
          <input type="text" placeholder="Navette, chauffeur..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', marginBottom: 0, height: '36px', fontSize: '13px' }} />
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'Toutes'], ['active', 'En cours'], ['pause', 'En pause'], ['finished', 'Terminées']].map(([key, lbl]) => (
            <button key={key} onClick={() => setStatusFilter(key)} className="btn" style={{
              height: '34px', padding: '0 13px', fontSize: '12.5px',
              fontWeight: statusFilter === key ? '600' : '500',
              background: statusFilter === key ? 'var(--nc-brand)' : 'transparent',
              color: statusFilter === key ? '#fff' : 'var(--nc-text-muted)',
              border: statusFilter === key ? 'none' : '1px solid var(--nc-line)',
            }}>{lbl}</button>
          ))}
        </div>

        {/* Date pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'Toutes dates'], ['today', "Aujourd'hui"], ['week', '7 jours'], ['month', '30 jours']].map(([key, lbl]) => (
            <button key={key} onClick={() => setDateFilter(key)} className="btn" style={{
              height: '34px', padding: '0 13px', fontSize: '12.5px',
              fontWeight: dateFilter === key ? '600' : '500',
              background: dateFilter === key ? 'var(--nc-surface-2)' : 'transparent',
              color: dateFilter === key ? 'var(--nc-text)' : 'var(--nc-text-muted)',
              border: dateFilter === key ? '1px solid var(--nc-line-strong)' : '1px solid var(--nc-line)',
            }}>{lbl}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)' }}>
            {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => exportCSV(sorted)}
            className="btn btn-secondary"
            style={{ height: '34px', padding: '0 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <IconDownload size={13} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ paddingLeft: '20px', ...thStyle('id') }} onClick={() => toggleSort('id')}>
                Tournée <SortIcon active={sortKey === 'id'} dir={sortDir} />
              </th>
              <th style={thStyle('shuttle_name')} onClick={() => toggleSort('shuttle_name')}>
                Navette <SortIcon active={sortKey === 'shuttle_name'} dir={sortDir} />
              </th>
              <th style={thStyle('driver_name')} onClick={() => toggleSort('driver_name')}>
                Chauffeur <SortIcon active={sortKey === 'driver_name'} dir={sortDir} />
              </th>
              <th style={thStyle('status')} onClick={() => toggleSort('status')}>
                Statut <SortIcon active={sortKey === 'status'} dir={sortDir} />
              </th>
              <th style={thStyle('started_at')} onClick={() => toggleSort('started_at')}>
                Départ → Arrivée <SortIcon active={sortKey === 'started_at'} dir={sortDir} />
              </th>
              <th>Durée</th>
              <th style={thStyle('delay_minutes')} onClick={() => toggleSort('delay_minutes')}>
                Retard <SortIcon active={sortKey === 'delay_minutes'} dir={sortDir} />
              </th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--nc-text-muted)', padding: '48px' }}>
                  Aucune tournée trouvée
                </td>
              </tr>
            ) : (
              sorted.map((trip, i) => {
                const color = tripColor(trip.id ?? i);
                const startTime = formatTime(trip.started_at);
                const endTime   = formatTime(trip.ended_at);
                return (
                  <tr key={trip.id}>
                    <td style={{ paddingLeft: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '3px', height: '34px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', fontFamily: 'var(--nc-font-mono)', color: 'var(--nc-text)', fontWeight: '600' }}>#{trip.id}</div>
                          <div style={{ fontSize: '11px', color: 'var(--nc-text-dim)', marginTop: '1px' }}>{formatDate(trip.started_at)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '500', color: 'var(--nc-text)', fontSize: '13px' }}>{trip.shuttle_name}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DriverAvatar name={trip.driver_name} />
                        <span style={{ fontSize: '13px', color: 'var(--nc-text-muted)' }}>{trip.driver_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge[trip.status] || 'badge-finished'}`}>
                        {statusLabel[trip.status] || trip.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontFamily: 'var(--nc-font-mono)' }}>
                        <span style={{ color: 'var(--nc-text-muted)' }}>{startTime}</span>
                        <svg width="22" height="8" viewBox="0 0 22 8" fill="none">
                          <line x1="0" y1="4" x2="15" y2="4" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                          <polyline points="11,1 15,4 11,7" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />
                        </svg>
                        {endTime
                          ? <span style={{ color: 'var(--nc-text-muted)' }}>{endTime}</span>
                          : <span style={{ color: '#3DD68C', fontWeight: '600' }}>En cours</span>
                        }
                      </div>
                    </td>
                    <td><DurationPill started={trip.started_at} ended={trip.ended_at} status={trip.status} /></td>
                    <td><DelayBadge minutes={trip.delay_minutes} /></td>
                    <td style={{ maxWidth: '140px' }}>
                      {trip.notes
                        ? <span title={trip.notes} style={{ fontSize: '12px', color: 'var(--nc-text-dim)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>{trip.notes}</span>
                        : <span style={{ color: 'var(--nc-line-strong)', fontSize: '14px' }}>—</span>
                      }
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Trips;
