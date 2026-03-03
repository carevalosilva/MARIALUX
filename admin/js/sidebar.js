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
        { id: 'usuarios', label: 'Usuarios', icon: '👤', href: '/admin/usuarios' },
        { id: 'parametros', label: 'Parámetros', icon: '⚙️', href: '/admin/parametros' }
    ];

    let html = '';
    html += '<div class="sidebar-header">';
    html += '  <div class="logo"><div class="logo-icon">M</div> <span id="sidebar-site-name"></span> <span class="badge">Admin</span></div>';
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

    // Inject hamburger button into header
    injectSidebarToggle();

    // Inject overlay for mobile sidebar
    injectSidebarOverlay();

    // Close sidebar when clicking navigation links (mobile)
    if (sidebar) {
        sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', () => {
                closeSidebar();
            });
        });
    }

    // Load dynamic site name
    loadSiteNameInAdmin();
}

// ============================================================
// Mobile sidebar toggle
// ============================================================

function injectSidebarToggle() {
    const header = document.querySelector('.main-header');
    if (!header || header.querySelector('.sidebar-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'sidebar-toggle';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.innerHTML = '☰';
    btn.onclick = toggleSidebar;
    header.insertBefore(btn, header.firstChild);
}

function injectSidebarOverlay() {
    if (document.querySelector('.sidebar-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle('open');
    if (overlay) {
        if (isOpen) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// Close sidebar on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        closeSidebar();
    }
});

async function loadSiteNameInAdmin() {
    try {
        const sb = getSupabase();
        if (!sb) return;
        const { data, error } = await sb
            .from('parametros_sitio')
            .select('clave, valor');
        if (error || !data) return;

        const params = {};
        data.forEach(function (row) { params[row.clave] = row.valor; });

        const siteName = params.nombre_sitio || '';

        // Update sidebar logo
        const sidebarName = document.getElementById('sidebar-site-name');
        if (sidebarName) sidebarName.textContent = siteName;

        // Update breadcrumb site name
        const breadcrumbSite = document.querySelector('.breadcrumb-site');
        if (breadcrumbSite) breadcrumbSite.textContent = siteName;

        // Update page title (prepend site name)
        const pageTitle = document.querySelector('title');
        if (pageTitle) {
            pageTitle.textContent = siteName + ' ' + pageTitle.textContent;
        }
    } catch (e) {
        // Silent fail — keep defaults
    }
}
