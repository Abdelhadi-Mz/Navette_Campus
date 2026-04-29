import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

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
const IconX = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconUsers = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  { bg: 'rgba(229,72,77,0.18)',   text: '#E5484D' },
  { bg: 'rgba(61,214,140,0.16)',  text: '#3DD68C' },
  { bg: 'rgba(77,166,255,0.16)',  text: '#4DA6FF' },
  { bg: 'rgba(245,166,35,0.16)',  text: '#F5A623' },
  { bg: 'rgba(176,124,245,0.16)', text: '#B07CF5' },
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ─── Sub-components ─── */
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

const PlateBadge = ({ plate }) => (
  plate
    ? <span style={{
        display: 'inline-block', padding: '3px 8px',
        background: 'var(--nc-surface-2)', border: '1px solid var(--nc-line-strong)',
        borderRadius: '6px', fontFamily: 'var(--nc-font-mono)',
        fontSize: '11.5px', fontWeight: '500', color: 'var(--nc-text-muted)', letterSpacing: '0.06em',
      }}>{plate}</span>
    : <span style={{ color: 'var(--nc-text-dim)' }}>—</span>
);

const DriverAvatar = ({ name }) => {
  const { bg, text } = avatarColor(name);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: bg, color: text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '700', flexShrink: 0,
      }}>
        {getInitials(name)}
      </div>
      <span style={{ fontSize: '13px', color: 'var(--nc-text)' }}>{name}</span>
    </div>
  );
};

const CapacityBar = ({ value }) => {
  const pct = Math.min((value / 60) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--nc-text)', minWidth: '24px' }}>{value}</span>
      <div style={{ flex: 1, height: '4px', background: 'var(--nc-surface-2)', borderRadius: '999px', overflow: 'hidden', minWidth: '60px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--nc-info)', borderRadius: '999px' }} />
      </div>
    </div>
  );
};

/* ─── Page ─── */
const Shuttles = () => {
  const toast = useToast();
  const [shuttles, setShuttles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShuttle, setEditingShuttle] = useState(null);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: '', plate_number: '', capacity: 20, driver_name: '', pin: '', status: 'active' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const fetchShuttles = async () => {
    try {
      const res = await api.get('/shuttles');
      setShuttles(res.data);
    } catch {
      toast.error('Impossible de charger les navettes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShuttles(); }, []);

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
      if (editingShuttle) {
        await api.put(`/shuttles/${editingShuttle.id}`, form);
        toast.success('Navette modifiée avec succès.');
      } else {
        await api.post('/shuttles', form);
        toast.success('Navette créée avec succès.');
      }
      fetchShuttles();
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Opération échouée.');
    }
  };

  const handleEdit = (shuttle) => {
    setEditingShuttle(shuttle);
    setForm({ name: shuttle.name, plate_number: shuttle.plate_number || '', capacity: shuttle.capacity, driver_name: shuttle.driver_name, pin: '', status: shuttle.status });
    setShowForm(true);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doDelete = async () => {
    try {
      await api.delete(`/shuttles/${confirmDelete.id}`);
      toast.success('Navette supprimée.');
      fetchShuttles();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const resetForm = () => {
    setForm({ name: '', plate_number: '', capacity: 20, driver_name: '', pin: '', status: 'active' });
    setEditingShuttle(null);
    setShowForm(false);
    setFormError('');
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  /* Derived stats */
  const totalActive   = shuttles.filter(s => s.status === 'active').length;
  const totalInactive = shuttles.filter(s => s.status === 'inactive').length;
  const totalCapacity = shuttles.reduce((sum, s) => sum + Number(s.capacity || 0), 0);

  /* Filter + sort */
  const filtered = shuttles.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.driver_name.toLowerCase().includes(q) || (s.plate_number || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thStyle = (key) => ({
    cursor: 'pointer',
    userSelect: 'none',
    color: sortKey === key ? 'var(--nc-text)' : undefined,
  });

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--nc-text-muted)' }}>Chargement...</div>
  );

  return (
    <div className="container" style={{ marginTop: '24px' }}>

      <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--nc-text)', marginBottom: '4px' }}>
        Navettes
      </h2>
      <p style={{ color: 'var(--nc-text-dim)', fontSize: '13px', marginBottom: '24px' }}>
        Gestion de la flotte de navettes
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total navettes"  value={shuttles.length} iconBg="rgba(229,72,77,0.14)"  iconColor="#E5484D" Icon={IconBus} />
        <StatCard label="Actives"         value={totalActive}     iconBg="rgba(61,214,140,0.14)" iconColor="#3DD68C" Icon={IconCheck} />
        <StatCard label="Inactives"       value={totalInactive}   iconBg="rgba(229,72,77,0.10)"  iconColor="#E5484D" Icon={IconX} />
        <StatCard label="Capacité totale" value={totalCapacity}   iconBg="rgba(77,166,255,0.14)" iconColor="#4DA6FF" Icon={IconUsers} />
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--nc-text)' }}>
                {editingShuttle ? 'Modifier la navette' : 'Nouvelle navette'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--nc-text-dim)', marginTop: '2px' }}>
                {editingShuttle ? `Édition de ${editingShuttle.name}` : 'Remplissez les informations ci-dessous'} · Échap pour fermer
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
              {[
                { label: 'Nom de la navette *', key: 'name', type: 'text', placeholder: 'Navette 1', required: true },
                { label: "Plaque d'immatriculation", key: 'plate_number', type: 'text', placeholder: 'A-1234-B' },
                { label: 'Nom du chauffeur *', key: 'driver_name', type: 'text', placeholder: 'Prénom Nom', required: true },
                { label: editingShuttle ? 'PIN (vide = inchangé)' : 'PIN *', key: 'pin', type: 'password', placeholder: '••••', required: !editingShuttle },
                { label: 'Capacité (passagers)', key: 'capacity', type: 'number', placeholder: '20', min: 1 },
              ].map(({ label, key, ...props }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </label>
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--nc-text-muted)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Statut
                </label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--nc-line)' }}>
              <button type="submit" className="btn btn-primary">
                <IconPlus />
                {editingShuttle ? 'Enregistrer les modifications' : 'Créer la navette'}
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
            placeholder="Rechercher navette, chauffeur ou plaque…"
            style={{ paddingLeft: '36px', marginBottom: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'Toutes'], ['active', 'Actives'], ['inactive', 'Inactives']].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={{
              padding: '0 14px', height: '38px', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--nc-font-sans)',
              background: statusFilter === val ? 'var(--nc-brand)' : 'var(--nc-surface-2)',
              color: statusFilter === val ? '#fff' : 'var(--nc-text-muted)',
              transition: 'background 0.15s, color 0.15s',
            }}>{lbl}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); else setEditingShuttle(null); }}>
          <IconPlus />
          {showForm ? 'Fermer' : 'Ajouter navette'}
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--nc-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--nc-text)' }}>
            {sorted.length} navette{sorted.length !== 1 ? 's' : ''}{statusFilter !== 'all' || search ? ' (filtrées)' : ''}
          </span>
          {(search || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--nc-brand)', fontFamily: 'var(--nc-font-sans)', fontWeight: '500' }}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px', ...thStyle('id') }} onClick={() => toggleSort('id')}>
                  ID <SortIcon active={sortKey === 'id'} dir={sortDir} />
                </th>
                <th style={thStyle('name')} onClick={() => toggleSort('name')}>
                  Navette <SortIcon active={sortKey === 'name'} dir={sortDir} />
                </th>
                <th style={thStyle('plate_number')} onClick={() => toggleSort('plate_number')}>
                  Plaque <SortIcon active={sortKey === 'plate_number'} dir={sortDir} />
                </th>
                <th style={thStyle('driver_name')} onClick={() => toggleSort('driver_name')}>
                  Chauffeur <SortIcon active={sortKey === 'driver_name'} dir={sortDir} />
                </th>
                <th style={thStyle('capacity')} onClick={() => toggleSort('capacity')}>
                  Capacité <SortIcon active={sortKey === 'capacity'} dir={sortDir} />
                </th>
                <th style={thStyle('status')} onClick={() => toggleSort('status')}>
                  Statut <SortIcon active={sortKey === 'status'} dir={sortDir} />
                </th>
                <th style={{ paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--nc-text-muted)' }}>
                    Aucune navette trouvée
                  </td>
                </tr>
              ) : sorted.map(shuttle => (
                <tr key={shuttle.id}>
                  <td style={{ paddingLeft: '20px', color: 'var(--nc-text-dim)', fontFamily: 'var(--nc-font-mono)', fontSize: '12px' }}>
                    #{shuttle.id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        background: shuttle.status === 'active' ? '#3DD68C' : '#E5484D',
                        boxShadow: shuttle.status === 'active' ? '0 0 5px rgba(61,214,140,0.5)' : 'none',
                      }} />
                      <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--nc-text)' }}>{shuttle.name}</span>
                    </div>
                  </td>
                  <td><PlateBadge plate={shuttle.plate_number} /></td>
                  <td><DriverAvatar name={shuttle.driver_name} /></td>
                  <td style={{ minWidth: '120px' }}><CapacityBar value={shuttle.capacity} /></td>
                  <td>
                    <span className={`badge badge-${shuttle.status}`}>
                      {shuttle.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ paddingRight: '20px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(shuttle)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '0 12px', height: '32px', border: 'none', borderRadius: '8px',
                        background: 'var(--nc-warning-soft)', color: 'var(--nc-warning)',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--nc-font-sans)',
                      }}>
                        <IconEdit /> Modifier
                      </button>
                      <button onClick={() => setConfirmDelete(shuttle)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', border: 'none', borderRadius: '8px',
                        background: 'var(--nc-danger-soft)', color: 'var(--nc-danger)', cursor: 'pointer',
                      }}>
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Supprimer la navette"
          message={`Êtes-vous sûr de vouloir supprimer « ${confirmDelete.name} » ? Cette action est irréversible.`}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Shuttles;
