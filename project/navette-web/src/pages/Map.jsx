import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* Route color palette — cycles per shuttle */
const ROUTE_COLORS = ['#E5484D', '#F5A623', '#3DD68C', '#4DA6FF', '#B07CF5'];

const busIconForColor = (color) => new L.DivIcon({
  html: `<div style="
    background:${color};color:white;border-radius:50%;
    width:42px;height:42px;display:flex;align-items:center;justify-content:center;
    font-size:20px;border:3px solid white;
    box-shadow:0 0 0 2px ${color}, 0 6px 16px ${color}90;">🚌</div>`,
  className: '',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const getStopMeta = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('biblioth'))                                                    return { emoji: '📚', color: '#3B82F6' };
  if (n.includes('café') || n.includes('cafét') || n.includes('cafe'))          return { emoji: '☕', color: '#F59E0B' };
  if (n.includes('amphi'))                                                       return { emoji: '🎓', color: '#8B5CF6' };
  if (n.includes('labo'))                                                        return { emoji: '🔬', color: '#06B6D4' };
  if (n.includes('admin') || n.includes('rectorat') || n.includes('direction')) return { emoji: '🏛️', color: '#6366F1' };
  if (n.includes('parking'))                                                     return { emoji: '🅿️', color: '#64748B' };
  if (n.includes('sport') || n.includes('gym') || n.includes('stade'))          return { emoji: '⚽', color: '#22C55E' };
  if (n.includes('restaur') || n.includes('cantine') || n.includes('réfect'))   return { emoji: '🍽️', color: '#F97316' };
  if (n.includes('résid') || n.includes('resid') || n.includes('foyer') || n.includes('dortoir')) return { emoji: '🏠', color: '#14B8A6' };
  if (n.includes('entrée') || n.includes('entree') || n.includes('portail') || n.includes('sortie')) return { emoji: '🚪', color: '#94A3B8' };
  if (n.includes('mosque') || n.includes('mosquée'))                            return { emoji: '🕌', color: '#10B981' };
  if (n.includes('médec') || n.includes('infirm') || n.includes('santé'))       return { emoji: '🏥', color: '#EF4444' };
  if (n.includes('info') || n.includes('numérique') || n.includes('numeric'))   return { emoji: '💻', color: '#2563EB' };
  if (n.includes('départ') || n.includes('depart') || n.includes('terminus'))   return { emoji: '🚏', color: '#475569' };
  if (n.includes('piscine'))                                                     return { emoji: '🏊', color: '#0EA5E9' };
  if (n.includes('jardin') || n.includes('parc'))                               return { emoji: '🌳', color: '#16A34A' };
  if (n.includes('salle') || n.includes('classe'))                              return { emoji: '🏫', color: '#7C3AED' };
  return { emoji: '📍', color: '#64748B' };
};

const stopIconForName = (name) => {
  const { emoji, color } = getStopMeta(name);
  return new L.DivIcon({
    html: `
      <div style="position:relative;width:36px;height:44px;display:flex;justify-content:center;align-items:flex-start;">
        <div style="
          width:36px;height:36px;
          background:${color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 14px ${color}80;
          border:2.5px solid rgba(255,255,255,0.95);
        ">
          <span style="transform:rotate(45deg);font-size:18px;line-height:1;display:block;">${emoji}</span>
        </div>
      </div>`,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
  });
};

/* ─── Helpers ─── */
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const getSpeedColor = (kmh) => {
  if (kmh >= 55) return '#E5484D';
  if (kmh >= 35) return '#F5A623';
  return '#3DD68C';
};

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
  return new Date(dateStr).toLocaleTimeString();
};

/* ─── Icons ─── */
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconSpeed = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12L8.5 8.5"/><circle cx="12" cy="12" r="1"/>
  </svg>
);
const IconLocation = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ─── Shuttle card ─── */
const ShuttleCard = ({ shuttle, color }) => {
  const speed = shuttle.speed_kmh ?? 0;
  const speedPct = Math.min((speed / 60) * 100, 100);
  const speedColor = getSpeedColor(speed);

  return (
    <div className="card" style={{
      marginBottom: 0,
      padding: 0,
      overflow: 'hidden',
      borderLeft: `3px solid ${color}`,
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--nc-line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px', height: '10px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}80`,
            flexShrink: 0,
          }} />
          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--nc-text)' }}>
            {shuttle.shuttle_name}
          </span>
        </div>
        <span className="badge badge-active" style={{ fontSize: '11px' }}>
          {shuttle.trip_status}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Driver */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: '50%',
            background: `${color}22`,
            border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700',
            color: color,
            flexShrink: 0,
          }}>
            {getInitials(shuttle.driver_name)}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--nc-text)', fontWeight: '500' }}>
            {shuttle.driver_name}
          </span>
        </div>

        {/* Speed + bar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--nc-text-muted)', fontSize: '12px' }}>
              <IconSpeed />
              Vitesse
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: speedColor }}>
              {speed} km/h
            </span>
          </div>
          {/* Speed bar track */}
          <div style={{
            height: '4px',
            background: 'var(--nc-surface-2)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${speedPct}%`,
              background: speedColor,
              borderRadius: '999px',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            <span style={{ fontSize: '10px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)' }}>0</span>
            <span style={{ fontSize: '10px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)' }}>60 km/h</span>
          </div>
        </div>

        {/* Coordinates */}
        {shuttle.latitude && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--nc-text-dim)', flexShrink: 0 }}><IconLocation /></span>
            <span style={{
              fontSize: '11px',
              color: 'var(--nc-text-dim)',
              fontFamily: 'var(--nc-font-mono)',
              letterSpacing: '0.03em',
            }}>
              {parseFloat(shuttle.latitude).toFixed(5)}, {parseFloat(shuttle.longitude).toFixed(5)}
            </span>
          </div>
        )}

        {/* Last update */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--nc-text-dim)', flexShrink: 0 }}><IconClock /></span>
          <span style={{
            fontSize: '11px',
            color: 'var(--nc-text-dim)',
            fontFamily: 'var(--nc-font-mono)',
          }}>
            {timeAgo(shuttle.recorded_at)}
          </span>
        </div>
      </div>

      {/* Delay banner */}
      {shuttle.delay_minutes > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(229,72,77,0.10)',
          borderTop: '1px solid rgba(229,72,77,0.18)',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--nc-danger)',
        }}>
          <IconAlert />
          Retard de {shuttle.delay_minutes} min
        </div>
      )}
    </div>
  );
};

/* ─── Map page ─── */
const Map = () => {
  const [shuttles, setShuttles] = useState([]);
  const [stops, setStops] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [shuttlesRes, stopsRes] = await Promise.all([
        api.get('/positions/latest'),
        api.get('/stops'),
      ]);
      setShuttles(shuttlesRes.data);
      setStops(stopsRes.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const center = [31.6295, -7.9811];

  const routePositions = [...stops]
    .filter(s => s.is_active && s.latitude && s.longitude)
    .sort((a, b) => a.stop_order - b.stop_order)
    .map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);

  /* Summary stats */
  const avgSpeed = shuttles.length > 0
    ? Math.round(shuttles.reduce((s, sh) => s + (sh.speed_kmh ?? 0), 0) / shuttles.length)
    : 0;
  const delayedCount = shuttles.filter(sh => sh.delay_minutes > 0).length;

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--nc-text-muted)' }}>
      Chargement de la carte...
    </div>
  );

  return (
    <div className="container" style={{ marginTop: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--nc-text)' }}>
          Carte en temps réel
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)' }}>
            {lastUpdate ? `MAJ ${lastUpdate.toLocaleTimeString()}` : ''}
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--nc-success)', fontWeight: '600' }}>
            ● Refresh 5s
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--nc-text-muted)' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#E5484D' }} />
          Navette active ({shuttles.length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--nc-text-muted)' }}>
          <span style={{ fontSize: '14px', lineHeight: 1 }}>📍</span>
          Arrêt ({stops.filter(s => s.is_active).length})
        </div>
        {routePositions.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--nc-text-muted)' }}>
            <span style={{
              display: 'inline-block', width: '22px', height: '2px',
              borderRadius: '2px',
              backgroundImage: 'repeating-linear-gradient(90deg, #94A3B8 0, #94A3B8 8px, transparent 8px, transparent 12px)',
            }} />
            Itinéraire
          </div>
        )}
      </div>

      {/* Map */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={16} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {shuttles.map((shuttle, idx) => {
            const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
            return shuttle.latitude && shuttle.longitude ? (
              <Marker
                key={shuttle.shuttle_id}
                position={[parseFloat(shuttle.latitude), parseFloat(shuttle.longitude)]}
                icon={busIconForColor(color)}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', color: 'var(--nc-text)' }}>
                      🚌 {shuttle.shuttle_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--nc-text-muted)', lineHeight: '1.8' }}>
                      <div>👤 {shuttle.driver_name}</div>
                      <div>⚡ {shuttle.speed_kmh} km/h</div>
                      <div style={{ fontFamily: 'var(--nc-font-mono)', fontSize: '11px' }}>
                        🕐 {new Date(shuttle.recorded_at).toLocaleTimeString()}
                      </div>
                      {shuttle.delay_minutes > 0 && (
                        <div style={{ color: '#E5484D', fontWeight: '600' }}>
                          ⚠️ Retard: {shuttle.delay_minutes} min
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null;
          })}

          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              color="#475569"
              weight={3}
              opacity={0.85}
              dashArray="8 4"
            />
          )}

          {stops.filter(s => s.is_active).map(stop => (
            <Marker
              key={stop.id}
              position={[parseFloat(stop.latitude), parseFloat(stop.longitude)]}
              icon={stopIconForName(stop.name)}
            >
              <Popup>
                <div style={{ minWidth: '140px' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: 'var(--nc-text)' }}>
                    📍 {stop.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--nc-text-muted)' }}>
                    <div>Arrêt #{stop.stop_order}</div>
                    {stop.description && <div>{stop.description}</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Navettes en circulation ── */}
      {shuttles.length > 0 && (
        <div style={{ marginTop: '24px' }}>

          {/* Section header + summary chips */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--nc-text)' }}>
                Navettes en circulation
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--nc-text-dim)', marginTop: '2px' }}>
                Données mises à jour toutes les 5 secondes
              </p>
            </div>

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '6px 12px',
                background: 'rgba(61,214,140,0.12)',
                border: '1px solid rgba(61,214,140,0.2)',
                borderRadius: '999px',
                fontSize: '12px', fontWeight: '600', color: '#3DD68C',
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3DD68C', display: 'inline-block' }} />
                {shuttles.length} active{shuttles.length > 1 ? 's' : ''}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '6px 12px',
                background: 'rgba(77,166,255,0.12)',
                border: '1px solid rgba(77,166,255,0.2)',
                borderRadius: '999px',
                fontSize: '12px', fontWeight: '600', color: '#4DA6FF',
              }}>
                ⚡ {avgSpeed} km/h moy
              </div>

              {delayedCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '6px 12px',
                  background: 'rgba(229,72,77,0.12)',
                  border: '1px solid rgba(229,72,77,0.2)',
                  borderRadius: '999px',
                  fontSize: '12px', fontWeight: '600', color: '#E5484D',
                }}>
                  ⚠ {delayedCount} en retard
                </div>
              )}
            </div>
          </div>

          {/* Shuttle cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {shuttles.map((shuttle, idx) => (
              <ShuttleCard
                key={shuttle.shuttle_id}
                shuttle={shuttle}
                color={ROUTE_COLORS[idx % ROUTE_COLORS.length]}
              />
            ))}
          </div>
        </div>
      )}

      {shuttles.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '16px', color: 'var(--nc-text-muted)' }}>
          Aucune navette en circulation actuellement
        </div>
      )}

    </div>
  );
};

export default Map;
