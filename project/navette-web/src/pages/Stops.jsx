import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

/* ─── Icons ─── */
const IconPin = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconCheck = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconRoute = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7H5.5a3.5 3.5 0 0 1 0-7H14" /><circle cx="18" cy="5" r="3" />
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
const ROUTE_COLORS = ['#E5484D', '#F5A623', '#3DD68C', '#4DA6FF', '#B07CF5'];
const stopColor = (order) => ROUTE_COLORS[(Number(order) - 1) % ROUTE_COLORS.length];

/* ─── Stat card ─── */
const StatCard = ({ label, value, iconBg, iconColor, Icon }) => (
  <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
    <div className="stat-icon" style={{ background: iconBg, marginBottom: '12px' }}>
      <Icon color={iconColor} />
    </div>
    <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--nc-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--nc-text-muted)', marginTop: '6px' }}>{label}</div>
  </div>
);

/* ─── Route overview panel ─── */
const RouteOverview = ({ stops }) => {
  const ordered = [...stops]
    .filter(s => s.stop_order != null)
    .sort((a, b) => a.stop_order - b.stop_order);

  if (ordered.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--nc-text)' }}>Aperçu de la route</div>
          <div style={{ fontSize: '12px', color: 'var(--nc-text-dim)', marginTop: '2px' }}>
            {ordered.length} arrêt{ordered.length > 1 ? 's' : ''} dans l'ordre de passage
          </div>
        </div>
        <div style={{ padding: '4px 10px', background: 'var(--nc-brand-soft)', borderRadius: 'var(--nc-r-pill)', fontSize: '11.5px', fontWeight: '600', color: 'var(--nc-brand)' }}>
          {ordered.filter(s => s.is_active).length} actifs
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ordered.map((stop, idx) => {
          const color = stopColor(stop.stop_order);
          const isLast = idx === ordered.length - 1;
          return (
            <div key={stop.id} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: stop.is_active ? `${color}22` : 'var(--nc-surface-2)',
                  border: `2px solid ${stop.is_active ? color : 'var(--nc-line-strong)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700',
                  color: stop.is_active ? color : 'var(--nc-text-dim)',
                  flexShrink: 0, zIndex: 1,
                }}>
                  {stop.stop_order}
                </div>
                {!isLast && (
                  <div style={{
                    width: '2px', flex: 1, minHeight: '20px',
                    background: `linear-gradient(to bottom, ${color}60, ${stopColor(ordered[idx + 1].stop_order)}60)`,
                    margin: '2px 0',
                  }} />
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '4px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: stop.is_active ? 'var(--nc-text)' : 'var(--nc-text-dim)' }}>
                    {stop.name}
                  </div>
                  {stop.description && (
                    <div style={{ fontSize: '11.5px', color: 'var(--nc-text-dim)', marginTop: '2px' }}>{stop.description}</div>
                  )}
                  <div style={{ fontFamily: 'var(--nc-font-mono)', fontSize: '10.5px', color: 'var(--nc-text-dim)', marginTop: '3px', letterSpacing: '0.03em' }}>
                    {parseFloat(stop.latitude).toFixed(4)}, {parseFloat(stop.longitude).toFixed(4)}
                  </div>
                </div>
                {!stop.is_active && (
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--nc-danger)', background: 'var(--nc-danger-soft)', padding: '2px 8px', borderRadius: 'var(--nc-r-pill)', flexShrink: 0, marginLeft: '12px', marginTop: '2px' }}>
                    Inactif
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Page ─── */
const Stops = () => {
  const toast = useToast();
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', stop_order: '', description: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRoute, setShowRoute] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const fetchStops = async () => {
    try {
      const res = await api.get('/stops');
      setStops(res.data);
    } catch {
      toast.error('Impossible de charger les arrêts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStops(); }, []);

  /* ESC closes form */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && showForm) resetForm(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingStop) {
        await api.put(`/stops/${editingStop.id}`, form);
        toast.success('Arrêt modifié avec succès.');
      } else {
        await api.post('/stops', form);
        toast.success('Arrêt créé avec succès.');
      }
      fetchStops();
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Opération échouée.');
    }
  };

  const handleEdit = (stop) => {
    setEditingStop(stop);
    setForm({ name: stop.name, latitude: stop.latitude, longitude: stop.longitude, stop_order: stop.stop_order, description: stop.description || '' });
    setShowForm(true);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doDelete = async () => {
    try {
      await api.delete(`/stops/${confirmDelete.id}`);
      toast.success('Arrêt supprimé.');
      fetchStops();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const resetForm = () => {
    setForm({ name: '', latitude: '', longitude: '', stop_order: '', description: '' });
    setEditingStop(null);
    setShowForm(false);
    setFormError('');
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const totalActive   = stops.filter(s => s.is_active).length;
  const totalInactive = stops.filter(s => !s.is_active).length;

  const filtered = stops.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? s.is_active : !s.is_active);
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thStyle = (key) => ({ cursor: 'pointer', userSelect: 'none', color: sortKey === key ? 'var(--nc-text)' : undefined });

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--nc-text-muted)' }}>Chargement...</div>
  );

  return (
    <div className="container" style={{ marginTop: '24px' }}>

      <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--nc-text)', marginBottom: '4px' }}>
        Arrêts
      </h2>
      <p style={{ color: 'var(--nc-text-dim)', fontSize: '13px', marginBottom: '24px' }}>
        Gestion des arrêts et de l'ordre de passage
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total arrêts"  value={stops.length}  iconBg="rgba(229,72,77,0.14)"  iconColor="#E5484D" Icon={IconPin} />
        <StatCard label="Actifs"        value={totalActive}   iconBg="rgba(61,214,140,0.14)" iconColor="#3DD68C" Icon={IconCheck} />
        <StatCard label="Inactifs"      value={totalInactive} iconBg="rgba(229,72,77,0.10)"  iconColor="#E5484D" Icon={IconX} />
      </div>

      {/* Route overview toggle */}
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--nc-text-muted)' }}>Aperçu de la route</span>
        <button onClick={() => setShowRoute(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: 'var(--nc-brand)', fontFamily: 'var(--nc-font-sans)' }}>
          {showRoute ? 'Masquer' : 'Afficher'}
        </button>
      </div>
      {showRoute && <RouteOverview stops={stops} />}

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--nc-text)' }}>
                {editingStop ? "Modifier l'arrêt" : 'Nouvel arrêt'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--nc-text-dim)', marginTop: '2px' }}>
                {editingStop ? `Édition de ${editingStop.name}` : 'Remplissez les coordonnées ci-dessous'} · Échap pour fermer
              </p>
            </div>
            <button onClick={resetForm} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--nc-text-dim)', padding: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {formError && (
            <div style={{ background: 'var(--nc-danger-soft)', border: '1px solid rgba(229,72,77,0.3)', color: 'var(--nc-danger)', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom de l'arrêt *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Bibliothèque" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ordre de passage</label>
                <input type="number" value={form.stop_order} onChange={e => setForm({ ...form, stop_order: e.target.value })} placeholder="1" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latitude *</label>
                <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="31.6295" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Longitude *</label>
                <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="-7.9811" required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description de l'arrêt (optionnel)" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--nc-line)' }}>
              <button type="submit" className="btn btn-primary">
                <IconPlus />{editingStop ? 'Enregistrer les modifications' : "Créer l'arrêt"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--nc-text-dim)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            <IconSearch />
          </span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou description…"
            style={{ paddingLeft: '36px', marginBottom: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'Tous'], ['active', 'Actifs'], ['inactive', 'Inactifs']].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={{
              padding: '0 14px', height: '38px', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--nc-font-sans)',
              background: statusFilter === val ? 'var(--nc-brand)' : 'var(--nc-surface-2)',
              color: statusFilter === val ? '#fff' : 'var(--nc-text-muted)',
              transition: 'background 0.15s, color 0.15s',
            }}>{lbl}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); else setEditingStop(null); }}>
          <IconPlus />{showForm ? 'Fermer' : 'Ajouter arrêt'}
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--nc-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--nc-text)' }}>
            {sorted.length} arrêt{sorted.length !== 1 ? 's' : ''}{statusFilter !== 'all' || search ? ' (filtrés)' : ''}
          </span>
          {(search || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--nc-brand)', fontFamily: 'var(--nc-font-sans)', fontWeight: '500' }}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px', ...thStyle('stop_order') }} onClick={() => toggleSort('stop_order')}>
                  Ordre <SortIcon active={sortKey === 'stop_order'} dir={sortDir} />
                </th>
                <th style={thStyle('name')} onClick={() => toggleSort('name')}>
                  Nom <SortIcon active={sortKey === 'name'} dir={sortDir} />
                </th>
                <th>Coordonnées</th>
                <th>Description</th>
                <th style={thStyle('is_active')} onClick={() => toggleSort('is_active')}>
                  Statut <SortIcon active={sortKey === 'is_active'} dir={sortDir} />
                </th>
                <th style={{ paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--nc-text-muted)' }}>Aucun arrêt trouvé</td>
                </tr>
              ) : sorted.map(stop => {
                const color = stopColor(stop.stop_order);
                return (
                  <tr key={stop.id}>
                    <td style={{ paddingLeft: '20px' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: `${color}1A`, border: `1.5px solid ${color}55`,
                        fontSize: '12px', fontWeight: '700', color,
                      }}>
                        {stop.stop_order}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--nc-text)' }}>{stop.name}</div>
                    </td>
                    <td>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 10px', background: 'var(--nc-surface-2)',
                        border: '1px solid var(--nc-line-strong)', borderRadius: '8px',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--nc-text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ fontFamily: 'var(--nc-font-mono)', fontSize: '11px', color: 'var(--nc-text-muted)', letterSpacing: '0.02em' }}>
                          {parseFloat(stop.latitude).toFixed(4)}, {parseFloat(stop.longitude).toFixed(4)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--nc-text-muted)', maxWidth: '200px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {stop.description || <span style={{ color: 'var(--nc-text-dim)' }}>—</span>}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${stop.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {stop.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ paddingRight: '20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEdit(stop)} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '0 12px', height: '32px', border: 'none', borderRadius: '8px',
                          background: 'var(--nc-warning-soft)', color: 'var(--nc-warning)',
                          fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--nc-font-sans)',
                        }}>
                          <IconEdit /> Modifier
                        </button>
                        <button onClick={() => setConfirmDelete(stop)} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', border: 'none', borderRadius: '8px',
                          background: 'var(--nc-danger-soft)', color: 'var(--nc-danger)', cursor: 'pointer',
                        }}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Supprimer l'arrêt"
          message={`Êtes-vous sûr de vouloir supprimer « ${confirmDelete.name} » ? Cette action est irréversible.`}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Stops;
