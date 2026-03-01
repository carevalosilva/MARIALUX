import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminList, adminCount } from '../api';

const STATS_TABLES = [
    { table: 'advocaciones', label: 'Advocaciones', icon: 'church', color: 'blue' },
    { table: 'continentes', label: 'Continentes', icon: 'public', color: 'green' },
    { table: 'paises', label: 'Países', icon: 'flag', color: 'purple' },
    { table: 'iconografia_items', label: 'Iconografías', icon: 'palette', color: 'orange' },
    { table: 'referencias_doctrinales', label: 'Referencias', icon: 'menu_book', color: 'pink' },
    { table: 'parametros_sitio', label: 'Parámetros', icon: 'settings', color: 'teal' },
];

export default function Dashboard() {
    const [counts, setCounts] = useState({});
    const [recentAdv, setRecentAdv] = useState([]);
    const [recentPaises, setRecentPaises] = useState([]);

    useEffect(() => {
        STATS_TABLES.forEach(async s => {
            try {
                const r = await adminCount(s.table);
                setCounts(c => ({ ...c, [s.table]: r.count }));
            } catch { /* ignore */ }
        });

        adminList('advocaciones', { page: 1, pageSize: 5, sort: 'created_at', asc: 'false' })
            .then(r => setRecentAdv(r.data)).catch(() => { });
        adminList('paises', { page: 1, pageSize: 5, sort: 'created_at', asc: 'false' })
            .then(r => setRecentPaises(r.data)).catch(() => { });
    }, []);

    return (
        <AdminLayout title="Dashboard" section="Panel de Control">
            <div className="stats-grid">
                {STATS_TABLES.map(s => (
                    <div key={s.table} className="stat-card">
                        <div className={`stat-icon ${s.color}`}>
                            <span className="material-icons-outlined">{s.icon}</span>
                        </div>
                        <div>
                            <div className="stat-value">{counts[s.table] ?? '—'}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header"><h2>Últimas Advocaciones</h2></div>
                    <div className="card-body">
                        <ul className="recent-list">
                            {recentAdv.map(a => (
                                <li key={a.id}>
                                    <span className="item-name">{a.nombre}</span>
                                    <span className="item-meta">{a.siglo || '—'}</span>
                                </li>
                            ))}
                            {recentAdv.length === 0 && <li className="text-center text-slate-400 text-sm">Sin datos</li>}
                        </ul>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><h2>Últimos Países</h2></div>
                    <div className="card-body">
                        <ul className="recent-list">
                            {recentPaises.map(p => (
                                <li key={p.id}>
                                    <span className="item-name">{p.nombre}</span>
                                    <span className="item-meta">{p.codigo_iso || '—'}</span>
                                </li>
                            ))}
                            {recentPaises.length === 0 && <li className="text-center text-slate-400 text-sm">Sin datos</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
