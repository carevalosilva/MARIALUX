import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getProfile, logout } from '../api';
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
                    <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
                        <span className="material-icons-outlined" style={{ fontSize: 18 }}>logout</span>
                    </button>
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
        </div>
    );
}
