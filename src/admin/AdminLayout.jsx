import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getProfile, logout, changePassword } from '../api';
import { useSiteParams } from '../context/SiteParamsContext';

const NAV_ITEMS = [
    {
        section: 'Principal', items: [
            { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        ]
    },
    {
        section: 'Contenido', items: [
            { path: '/admin/advocaciones', icon: 'church', label: 'Advocaciones' },
            { path: '/admin/continentes', icon: 'public', label: 'Continentes' },
            { path: '/admin/paises', icon: 'flag', label: 'Países' },
            { path: '/admin/iconografia', icon: 'palette', label: 'Iconografía' },
            { path: '/admin/referencias', icon: 'menu_book', label: 'Referencias' },
        ]
    },
    {
        section: 'Sistema', items: [
            { path: '/admin/usuarios', icon: 'people', label: 'Usuarios' },
            { path: '/admin/parametros', icon: 'settings', label: 'Parámetros' },
        ]
    },
];

export default function AdminLayout({ children, title, section }) {
    const nav = useNavigate();
    const loc = useLocation();
    const params = useSiteParams();
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);
    const siteName = params.nombre_sitio || 'MARIALUX';

    // Password modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passForm, setPassForm] = useState({ current: '', new1: '', new2: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('auth_token');
        if (!token) { nav('/admin'); return; }
        getProfile()
            .then(u => { setUser(u); setChecking(false); })
            .catch(() => { sessionStorage.removeItem('auth_token'); nav('/admin'); });
    }, [nav]);

    useEffect(() => {
        document.title = title ? `${siteName} Admin — ${title}` : `${siteName} Admin`;
    }, [title, siteName]);

    const handleLogout = async () => {
        await logout();
        nav('/admin');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess(false);

        if (passForm.new1 !== passForm.new2) {
            setPassError('Las contraseñas nuevas no coinciden');
            return;
        }
        if (passForm.new1.length < 6) {
            setPassError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        setPassLoading(true);
        try {
            await changePassword(passForm.current, passForm.new1);
            setPassSuccess(true);
            setPassForm({ current: '', new1: '', new2: '' });
            setTimeout(() => {
                setShowPasswordModal(false);
                setPassSuccess(false);
            }, 2000);
        } catch (err) {
            setPassError(err.message || 'Error al cambiar contraseña');
        }
        setPassLoading(false);
    };

    if (checking) return <div className="min-h-screen flex items-center justify-center text-slate-400">Verificando sesión...</div>;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">✝</div>
                        <span>{siteName}</span>
                        <span className="badge">Admin</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(group => (
                        <div key={group.section}>
                            <div className="nav-section">{group.section}</div>
                            {group.items.map(item => (
                                <Link key={item.path} to={item.path}
                                    className={loc.pathname === item.path ? 'active' : ''}>
                                    <span className="icon material-icons-outlined">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="avatar">{(user?.nombre || user?.email || 'A')[0].toUpperCase()}</div>
                    <div className="user-info">
                        <div className="user-name">{user?.nombre || user?.email}</div>
                        <div className="user-role">{user?.rol || 'admin'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-logout" onClick={() => setShowPasswordModal(true)} title="Cambiar contraseña" style={{ padding: '8px', color: '#64748b' }}>
                            <span className="material-icons-outlined" style={{ fontSize: 18 }}>vpn_key</span>
                        </button>
                        <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión" style={{ padding: '8px' }}>
                            <span className="material-icons-outlined" style={{ fontSize: 18 }}>logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content">
                <header className="main-header">
                    <div>
                        <h1>{title || 'Dashboard'}</h1>
                        <div className="breadcrumb">
                            <span>{siteName}</span>{section ? ` · ${section}` : ''}
                        </div>
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setShowPasswordModal(false)}>
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3>Cambiar Contraseña</h3>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {passSuccess ? (
                                <div style={{ color: '#16a34a', background: '#dcfce7', padding: '12px', borderRadius: '6px', textAlign: 'center', marginBottom: '16px' }}>
                                    ¡Contraseña actualizada correctamente!
                                </div>
                            ) : (
                                <form id="passForm" onSubmit={handlePasswordSubmit}>
                                    {passError && (
                                        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                                            {passError}
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label>Contraseña actual *</label>
                                        <input type="password" required
                                            value={passForm.current}
                                            onChange={e => setPassForm(prev => ({ ...prev, current: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nueva contraseña *</label>
                                        <input type="password" required minLength={6}
                                            value={passForm.new1}
                                            onChange={e => setPassForm(prev => ({ ...prev, new1: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirmar nueva contraseña *</label>
                                        <input type="password" required minLength={6}
                                            value={passForm.new2}
                                            onChange={e => setPassForm(prev => ({ ...prev, new2: e.target.value }))}
                                        />
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                            {!passSuccess && (
                                <button type="submit" form="passForm" className="btn btn-primary" disabled={passLoading}>
                                    {passLoading ? 'Guardando...' : 'Guardar'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
