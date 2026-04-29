import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../api/axios';

const API_BASE = 'http://localhost:3000/api';

/* ─── Icons ─── */
const IconBus = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="13" rx="3" /><path d="M2 10h20" />
    <circle cx="7.5" cy="18.5" r="1.5" /><circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);
const IconCheck = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconPin = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconActivity = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconFlag = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const IconClock = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconChevron = ({ up }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--nc-text-muted)', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── Custom dark tooltips ─── */
const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1D2229', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px' }}>
      <div style={{ color: '#6B727C', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#E5484D', fontWeight: '700', fontSize: '14px' }}>
        {payload[0].value} tournée{payload[0].value !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1D2229', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px' }}>
      <span style={{ color: payload[0].payload.color, fontWeight: '600' }}>
        {payload[0].name}: {payload[0].value}
      </span>
    </div>
  );
};

/* ─── Range pill ─── */
const RangeBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '4px 12px', height: '28px', border: 'none', borderRadius: '8px',
    fontSize: '12px', fontWeight: active ? '600' : '500', cursor: 'pointer',
    fontFamily: 'var(--nc-font-sans)',
    background: active ? 'var(--nc-brand)' : 'var(--nc-surface-2)',
    color: active ? '#fff' : 'var(--nc-text-muted)',
    transition: 'background 0.15s, color 0.15s',
  }}>
    {label}
  </button>
);

/* ─── Dashboard ─── */
const Dashboard = () => {
  const [stats, setStats] = useState({ totalShuttles: 0, activeShuttles: 0, totalStops: 0, activeTrips: 0, finishedToday: 0, onTimeRate: 100 });
  const [activeTrips, setActiveTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today');
  const [shuttles, setShuttles] = useState([]);
  const [simStops, setSimStops] = useState([]);

  /* ── Simulator state ── */
  const [simOpen, setSimOpen] = useState(false);
  const [simShuttleId, setSimShuttleId] = useState('');
  const [simPin, setSimPin] = useState('');
  const [simToken, setSimToken] = useState(null);
  const [simShuttle, setSimShuttle] = useState(null);
  const [simTripId, setSimTripId] = useState(null);
  const [simStatus, setSimStatus] = useState(null);
  const [simLat, setSimLat] = useState('31.62950');
  const [simLng, setSimLng] = useState('-7.98110');
  const [simSpeed, setSimSpeed] = useState('30');
  const [simLog, setSimLog] = useState([]);
  const [simLoading, setSimLoading] = useState(false);
  const [simAutoRunning, setSimAutoRunning] = useState(false);
  const simAutoRef = useRef(null);
  const simStopIdxRef = useRef(0);

  const fetchData = async () => {
    try {
      const [shuttlesRes, stopsRes, activeRes, allRes] = await Promise.all([
        api.get('/shuttles'), api.get('/stops'), api.get('/trips/active'), api.get('/trips'),
      ]);
      const sh  = shuttlesRes.data;
      const all = allRes.data;
      const today = new Date().toDateString();
      const finishedToday = all.filter(t => t.status === 'finished' && new Date(t.started_at).toDateString() === today).length;
      const onTimeRate = all.length > 0
        ? Math.round((all.filter(t => !t.delay_minutes || t.delay_minutes <= 0).length / all.length) * 100)
        : 100;
      setStats({ totalShuttles: sh.length, activeShuttles: sh.filter(s => s.status === 'active').length, totalStops: stopsRes.data.length, activeTrips: activeRes.data.length, finishedToday, onTimeRate });
      setActiveTrips(activeRes.data);
      setAllTrips(all);
      setShuttles(sh.filter(s => s.status === 'active'));
      setSimStops(stopsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => { if (simAutoRef.current) clearInterval(simAutoRef.current); };
  }, []);

  /* ── Simulator helpers ── */
  const addLog = (type, msg) =>
    setSimLog(prev => [{ type, msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));

  const driverFetch = (method, path, data, token) =>
    axios({ method, url: `${API_BASE}${path}`, data, headers: { Authorization: `Bearer ${token}` } });

  const simLogin = async () => {
    setSimLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/driver`, {
        shuttle_id: parseInt(simShuttleId),
        pin: simPin,
      });
      setSimToken(res.data.token);
      setSimShuttle(res.data.shuttle);
      setSimPin('');
      addLog('success', `Connecté — ${res.data.shuttle.name}`);
    } catch (e) {
      addLog('error', `Connexion échouée: ${e.response?.data?.error || 'PIN incorrect'}`);
    } finally {
      setSimLoading(false);
    }
  };

  const simLogout = () => {
    if (simAutoRef.current) { clearInterval(simAutoRef.current); simAutoRef.current = null; }
    setSimAutoRunning(false);
    setSimToken(null); setSimShuttle(null);
    setSimTripId(null); setSimStatus(null);
    setSimLog([]);
  };

  const simStart = async () => {
    setSimLoading(true);
    try {
      const res = await driverFetch('post', '/trips/start', null, simToken);
      setSimTripId(res.data.trip_id);
      setSimStatus('active');
      addLog('success', `Tournée #${res.data.trip_id} démarrée`);
      fetchData();
    } catch (e) {
      const existingId = e.response?.data?.trip_id;
      if (existingId) {
        setSimTripId(existingId);
        setSimStatus('active');
        addLog('info', `Tournée existante #${existingId} récupérée`);
      } else {
        addLog('error', `Erreur: ${e.response?.data?.error || e.message}`);
      }
    } finally {
      setSimLoading(false);
    }
  };

  const simSendPos = async () => {
    const lat = parseFloat(simLat), lng = parseFloat(simLng), speed = parseInt(simSpeed) || 0;
    if (isNaN(lat) || isNaN(lng)) { addLog('error', 'Coordonnées invalides'); return; }
    setSimLoading(true);
    try {
      await driverFetch('post', '/positions', { latitude: lat, longitude: lng, speed_kmh: speed }, simToken);
      addLog('success', `(${lat.toFixed(4)}, ${lng.toFixed(4)}) · ${speed} km/h`);
    } catch (e) {
      addLog('error', `Erreur position: ${e.response?.data?.error || e.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  const simSetStatus = async (status) => {
    setSimLoading(true);
    try {
      await driverFetch('put', `/trips/${simTripId}/status`, { status }, simToken);
      setSimStatus(status);
      addLog('success', `Statut → ${status}`);
      if (status === 'finished' && simAutoRef.current) {
        clearInterval(simAutoRef.current); simAutoRef.current = null;
        setSimAutoRunning(false);
      }
      fetchData();
    } catch (e) {
      addLog('error', `Erreur statut: ${e.response?.data?.error || e.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  const simToggleAuto = () => {
    if (simAutoRunning) {
      clearInterval(simAutoRef.current); simAutoRef.current = null;
      setSimAutoRunning(false);
      addLog('info', 'Simulation auto arrêtée');
      return;
    }
    const activeStops = [...simStops]
      .filter(s => s.is_active && s.latitude && s.longitude)
      .sort((a, b) => a.stop_order - b.stop_order);
    if (activeStops.length < 2) {
      addLog('error', 'Pas assez d\'arrêts actifs pour simuler');
      return;
    }
    simStopIdxRef.current = 0;
    setSimAutoRunning(true);
    addLog('info', `Auto-sim démarrée · ${activeStops.length} arrêts · toutes les 3s`);
    const token = simToken;
    simAutoRef.current = setInterval(async () => {
      const stop = activeStops[simStopIdxRef.current % activeStops.length];
      const speed = Math.floor(Math.random() * 26) + 20;
      setSimLat(parseFloat(stop.latitude).toFixed(5));
      setSimLng(parseFloat(stop.longitude).toFixed(5));
      setSimSpeed(String(speed));
      try {
        await axios({
          method: 'post',
          url: `${API_BASE}/positions`,
          data: { latitude: parseFloat(stop.latitude), longitude: parseFloat(stop.longitude), speed_kmh: speed },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSimLog(prev => [{
          type: 'success',
          msg: `→ "${stop.name}" · ${speed} km/h`,
          time: new Date().toLocaleTimeString(),
        }, ...prev].slice(0, 10));
      } catch (e) {
        setSimLog(prev => [{
          type: 'error',
          msg: `Erreur position: ${e.response?.data?.error || e.message}`,
          time: new Date().toLocaleTimeString(),
        }, ...prev].slice(0, 10));
      }
      simStopIdxRef.current++;
    }, 3000);
  };

  /* ── Chart / stats computed values ── */
  const now = new Date();
  const rangedTrips = useMemo(() => {
    if (range === 'today') {
      const todayStr = now.toDateString();
      return allTrips.filter(t => new Date(t.started_at).toDateString() === todayStr);
    }
    const days = range === '7d' ? 7 : 30;
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
    return allTrips.filter(t => new Date(t.started_at) >= cutoff);
  }, [allTrips, range]);

  const chartData = useMemo(() => {
    if (range === 'today') {
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${String(h).padStart(2, '0')}h`,
        count: rangedTrips.filter(t => new Date(t.started_at).getHours() === h).length,
      })).filter(d => d.count > 0);
    }
    const days = range === '7d' ? 7 : 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const dStr = d.toDateString();
      return {
        label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        count: rangedTrips.filter(t => new Date(t.started_at).toDateString() === dStr).length,
      };
    });
  }, [rangedTrips, range]);

  const donutData = [
    { name: 'Active',    value: rangedTrips.filter(t => t.status === 'active').length,   color: '#3DD68C' },
    { name: 'En pause',  value: rangedTrips.filter(t => t.status === 'pause').length,    color: '#F5A623' },
    { name: 'Terminées', value: rangedTrips.filter(t => t.status === 'finished').length, color: '#4DA6FF' },
  ].filter(d => d.value > 0);

  const statCards = [
    { key: 'totalShuttles',  label: 'Total Navettes',        iconBg: 'rgba(229,72,77,0.14)',   iconColor: '#E5484D', Icon: IconBus },
    { key: 'activeShuttles', label: 'Navettes Actives',      iconBg: 'rgba(61,214,140,0.14)',  iconColor: '#3DD68C', Icon: IconCheck },
    { key: 'totalStops',     label: 'Arrêts',                iconBg: 'rgba(77,166,255,0.14)',  iconColor: '#4DA6FF', Icon: IconPin },
    { key: 'activeTrips',    label: 'Tournées en cours',     iconBg: 'rgba(245,166,35,0.16)',  iconColor: '#F5A623', Icon: IconActivity },
    { key: 'finishedToday',  label: "Terminées aujourd'hui", iconBg: 'rgba(176,124,245,0.14)', iconColor: '#B07CF5', Icon: IconFlag },
    { key: 'onTimeRate',     label: 'Ponctualité',           iconBg: 'rgba(61,214,140,0.14)',  iconColor: '#3DD68C', Icon: IconClock, suffix: '%' },
  ];

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--nc-text-muted)' }}>Chargement...</div>
  );

  return (
    <div className="container" style={{ marginTop: '24px' }}>

      <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--nc-text)', marginBottom: '4px' }}>
        Dashboard
      </h2>
      <p style={{ color: 'var(--nc-text-dim)', fontSize: '13px', marginBottom: '24px' }}>
        Vue d'ensemble de l'activité des navettes
      </p>

      {/* 6 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {statCards.map(({ key, label, iconBg, iconColor, Icon, suffix }) => (
          <div key={key} className="card" style={{ padding: '20px', marginBottom: 0 }}>
            <div className="stat-icon" style={{ background: iconBg, marginBottom: '12px' }}>
              <Icon color={iconColor} />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--nc-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {stats[key]}{suffix || ''}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--nc-text-muted)', marginTop: '6px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Area chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--nc-text)', marginBottom: '2px' }}>
                Activité des tournées
              </div>
              <div style={{ fontSize: '12px', color: 'var(--nc-text-dim)' }}>
                {range === 'today' ? "Par heure — aujourd'hui" : range === '7d' ? '7 derniers jours' : '30 derniers jours'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <RangeBtn label="Auj." active={range === 'today'} onClick={() => setRange('today')} />
              <RangeBtn label="7j"   active={range === '7d'}    onClick={() => setRange('7d')} />
              <RangeBtn label="30j"  active={range === '30d'}   onClick={() => setRange('30d')} />
            </div>
          </div>
          {chartData.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nc-text-muted)', fontSize: '13px' }}>
              Aucune donnée pour cette période
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E5484D" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E5484D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6B727C', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B727C', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<AreaTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#E5484D" strokeWidth={2} fill="url(#brandGrad)"
                  dot={{ fill: '#E5484D', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#E5484D', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--nc-text)', marginBottom: '2px' }}>Répartition des tournées</div>
          <div style={{ fontSize: '12px', color: 'var(--nc-text-dim)', marginBottom: '16px' }}>
            Par statut · {range === 'today' ? "aujourd'hui" : range === '7d' ? '7 jours' : '30 jours'}
          </div>
          {donutData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nc-text-muted)', fontSize: '13px' }}>
              Aucune donnée
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {donutData.map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--nc-text-muted)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--nc-text)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active trips table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--nc-text)' }}>Tournées actives</h3>
          <span style={{ fontSize: '11px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)', letterSpacing: '0.06em' }}>
            Auto-refresh toutes les 10s
          </span>
        </div>
        {activeTrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--nc-text-muted)' }}>
            Aucune tournée active pour le moment
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Navette</th><th>Chauffeur</th><th>Statut</th>
                <th>Démarré à</th><th>Retard</th><th>Dernière position</th>
              </tr>
            </thead>
            <tbody>
              {activeTrips.map(trip => (
                <tr key={trip.trip_id}>
                  <td style={{ fontWeight: '500' }}>{trip.shuttle_name}</td>
                  <td>{trip.driver_name}</td>
                  <td><span className={`badge badge-${trip.trip_status}`}>{trip.trip_status}</span></td>
                  <td style={{ fontFamily: 'var(--nc-font-mono)', fontSize: '12px', color: 'var(--nc-text-muted)' }}>
                    {new Date(trip.started_at).toLocaleTimeString()}
                  </td>
                  <td>
                    {trip.delay_minutes > 0
                      ? <span style={{ color: 'var(--nc-danger)', fontWeight: '500' }}>{trip.delay_minutes} min</span>
                      : <span style={{ color: 'var(--nc-success)' }}>À l'heure</span>
                    }
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)' }}>
                    {trip.latitude
                      ? `${parseFloat(trip.latitude).toFixed(4)}, ${parseFloat(trip.longitude).toFixed(4)}`
                      : 'Pas encore de position'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─────────── Simuler chauffeur ─────────── */}
      <div className="card" style={{ borderColor: simOpen ? 'rgba(245,166,35,0.45)' : 'var(--nc-line)', transition: 'border-color 0.2s' }}>

        {/* Header — always visible, click to toggle */}
        <div
          onClick={() => setSimOpen(v => !v)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'rgba(245,166,35,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5A623"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--nc-text)' }}>Simuler chauffeur</span>
              <span style={{ fontSize: '10px', background: 'rgba(245,166,35,0.14)', color: '#F5A623', padding: '2px 7px', borderRadius: '999px', fontWeight: '700', letterSpacing: '0.06em' }}>
                DEV
              </span>
              {simStatus === 'active' && (
                <span style={{ fontSize: '11.5px', color: '#3DD68C', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3DD68C', display: 'inline-block' }} />
                  Tournée #{simTripId}
                </span>
              )}
              {simAutoRunning && (
                <span style={{ fontSize: '11px', color: '#F5A623', fontWeight: '600' }}>· Auto-sim ●</span>
              )}
            </div>
          </div>
          <IconChevron up={simOpen} />
        </div>

        {/* Collapsible body */}
        {simOpen && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--nc-line)', paddingTop: '20px' }}>

            {/* 3-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '28px', alignItems: 'start', marginBottom: '16px' }}>

              {/* ── Step 1: Auth ── */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--nc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  1 · Authentification
                </div>
                {!simToken ? (
                  <>
                    <select value={simShuttleId} onChange={e => setSimShuttleId(e.target.value)}>
                      <option value="">Choisir une navette…</option>
                      {shuttles.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {s.driver_name}</option>
                      ))}
                    </select>
                    <input
                      type="password"
                      placeholder="PIN chauffeur"
                      value={simPin}
                      onChange={e => setSimPin(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && simLogin()}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={simLogin}
                      disabled={simLoading || !simShuttleId || !simPin}
                    >
                      {simLoading ? 'Connexion…' : 'Se connecter'}
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      padding: '10px 12px',
                      background: 'rgba(61,214,140,0.08)',
                      border: '1px solid rgba(61,214,140,0.22)',
                      borderRadius: '10px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3DD68C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#3DD68C', letterSpacing: '0.04em' }}>CONNECTÉ</span>
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--nc-text)' }}>{simShuttle?.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--nc-text-muted)', marginTop: '2px' }}>{simShuttle?.driver_name}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: '12px', height: '32px' }} onClick={simLogout}>
                      Déconnecter
                    </button>
                  </div>
                )}
              </div>

              {/* ── Step 2: Trip ── */}
              <div style={{ opacity: simToken ? 1 : 0.35, pointerEvents: simToken ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--nc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  2 · Tournée
                </div>
                {!simTripId ? (
                  <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={simStart} disabled={simLoading}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    {simLoading ? 'Démarrage…' : 'Démarrer tournée'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span className={`badge badge-${simStatus}`}>{simStatus}</span>
                      <span style={{ fontFamily: 'var(--nc-font-mono)', fontSize: '11px', color: 'var(--nc-text-dim)' }}>
                        #{simTripId}
                      </span>
                    </div>
                    {simStatus === 'active' && (
                      <button className="btn btn-warning" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={() => simSetStatus('pause')} disabled={simLoading}>
                        ⏸ Pause
                      </button>
                    )}
                    {simStatus === 'pause' && (
                      <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={() => simSetStatus('active')} disabled={simLoading}>
                        ▶ Reprendre
                      </button>
                    )}
                    {simStatus !== 'finished' && (
                      <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={() => simSetStatus('finished')} disabled={simLoading}>
                        🏁 Terminer
                      </button>
                    )}
                    {simStatus === 'finished' && (
                      <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }} onClick={() => { setSimTripId(null); setSimStatus(null); }}>
                        Nouvelle tournée
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Step 3: Position ── */}
              <div style={{ opacity: simStatus === 'active' ? 1 : 0.35, pointerEvents: simStatus === 'active' ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--nc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  3 · Position GPS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0' }}>
                  <input
                    placeholder="Latitude"
                    value={simLat}
                    onChange={e => setSimLat(e.target.value)}
                    style={{ marginBottom: 0, fontSize: '12px', fontFamily: 'var(--nc-font-mono)' }}
                  />
                  <input
                    placeholder="Longitude"
                    value={simLng}
                    onChange={e => setSimLng(e.target.value)}
                    style={{ marginBottom: 0, fontSize: '12px', fontFamily: 'var(--nc-font-mono)' }}
                  />
                </div>
                <input
                  placeholder="Vitesse (km/h)"
                  value={simSpeed}
                  onChange={e => setSimSpeed(e.target.value)}
                  style={{ marginBottom: '8px', fontSize: '12px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
                    onClick={simSendPos}
                    disabled={simLoading || simAutoRunning}
                  >
                    Envoyer
                  </button>
                  <button
                    className={simAutoRunning ? 'btn btn-warning' : 'btn btn-secondary'}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
                    onClick={simToggleAuto}
                    title="Parcourt automatiquement les arrêts actifs toutes les 3s"
                  >
                    {simAutoRunning ? '⏹ Stop' : '⟳ Auto'}
                  </button>
                </div>
              </div>
            </div>

            {/* Activity log */}
            {simLog.length > 0 && (
              <div style={{
                background: 'var(--nc-bg)',
                border: '1px solid var(--nc-line)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: 'var(--nc-font-mono)',
                fontSize: '11.5px',
                maxHeight: '136px',
                overflowY: 'auto',
              }}>
                {simLog.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', marginBottom: i < simLog.length - 1 ? '5px' : 0 }}>
                    <span style={{ color: 'var(--nc-text-dim)', flexShrink: 0 }}>{entry.time}</span>
                    <span style={{ flexShrink: 0, color: entry.type === 'success' ? '#3DD68C' : entry.type === 'error' ? '#E5484D' : '#4DA6FF' }}>
                      {entry.type === 'success' ? '✓' : entry.type === 'error' ? '✗' : '›'}
                    </span>
                    <span style={{ color: 'var(--nc-text-muted)' }}>{entry.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
