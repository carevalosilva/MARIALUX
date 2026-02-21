// ============================================================
// Sidebar HTML generator — used by all admin pages
// ============================================================

function renderSidebar(activePage) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/admin/dashboard' },
        { id: 'continentes', label: 'Continentes', icon: '🌐', href: '/admin/continentes' },
        { id: 'paises', label: 'Países', icon: '🏳️', href: '/admin/paises' },
        { id: 'advocaciones', label: 'Advocaciones', icon: '⭐', href: '/admin/advocaciones' },
        { id: 'iconografia', label: 'Iconografía', icon: '🖼️', href: '/admin/iconografia' },
        { id: 'referencias', label: 'Referencias', icon: '📖', href: '/admin/referencias' },
        { id: 'usuarios', label: 'Usuarios', icon: '👤', href: '/admin/usuarios' }
    ];

    let html = '';
    html += '<div class="sidebar-header">';
    html += '  <div class="logo"><div class="logo-icon">M</div> MARIALUX <span class="badge">Admin</span></div>';
    html += '</div>';
    html += '<nav class="sidebar-nav">';
    html += '  <div class="nav-section">Navegación</div>';

    navItems.forEach(item => {
        const cls = item.id === activePage ? ' active' : '';
        html += '  <a href="' + item.href + '" class="' + cls + '">';
        html += '    <span class="icon">' + item.icon + '</span>';
        html += '    ' + item.label;
        html += '  </a>';
    });

    html += '</nav>';
    html += '<div class="sidebar-footer">';
    html += '  <div class="avatar">A</div>';
    html += '  <div class="user-info">';
    html += '    <div class="user-name">Cargando...</div>';
    html += '    <div class="user-role">—</div>';
    html += '  </div>';
    html += '  <button class="btn-logout" onclick="adminLogout()" title="Cerrar sesión">⏻</button>';
    html += '</div>';

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.innerHTML = html;
}
