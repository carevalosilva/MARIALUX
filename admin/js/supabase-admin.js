// ============================================================
// Admin — Supabase Client & Auth
// ============================================================

const SUPABASE_URL = 'https://abkseebmtwmfxmrgiqgr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia3NlZWJtdHdtZnhtcmdpcWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzQwODIsImV4cCI6MjA4NjQxMDA4Mn0.4C0l888NPcbCnX3Eb1aYRa5AcscBdUWn7gtnMXOa0aY';

let _sb = null;
let _currentUser = null;
let _currentProfile = null;

function getSupabase() {
    if (_sb) return _sb;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return _sb;
    }
    console.error('[Admin] Supabase JS not loaded');
    return null;
}

// ============================================================
// AUTH
// ============================================================

async function adminLogin(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Fetch or create profile
    const profile = await fetchOrCreateProfile(data.user);
    _currentUser = data.user;
    _currentProfile = profile;
    return { user: data.user, profile };
}

async function adminLogout() {
    const sb = getSupabase();
    await sb.auth.signOut();
    _currentUser = null;
    _currentProfile = null;
    window.location.href = '/admin/';
}

async function getSession() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session;
}

async function fetchOrCreateProfile(authUser) {
    const sb = getSupabase();
    // Try to get existing profile
    const { data, error } = await sb
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

    if (data) return data;

    // Create profile if it doesn't exist (first admin)
    const { data: newProfile, error: insertErr } = await sb
        .from('usuarios')
        .insert({
            id: authUser.id,
            nombre: authUser.user_metadata?.nombre || authUser.email.split('@')[0],
            apellido: authUser.user_metadata?.apellido || '',
            email: authUser.email,
            rol: 'admin',
            activo: true
        })
        .select()
        .single();

    if (insertErr) {
        console.error('[Admin] Error creating profile:', insertErr);
        return { id: authUser.id, nombre: authUser.email.split('@')[0], apellido: '', email: authUser.email, rol: 'admin', activo: true };
    }
    return newProfile;
}

async function getCurrentProfile() {
    if (_currentProfile) return _currentProfile;
    const session = await getSession();
    if (!session) return null;
    _currentUser = session.user;
    _currentProfile = await fetchOrCreateProfile(session.user);
    return _currentProfile;
}

// ============================================================
// AUTH GUARD — call on every protected page
// ============================================================

async function requireAuth() {
    const session = await getSession();
    if (!session) {
        window.location.href = '/admin/';
        return false;
    }
    const profile = await getCurrentProfile();
    updateSidebarUser(profile);
    return true;
}

function updateSidebarUser(profile) {
    if (!profile) return;
    const nameEl = document.querySelector('.sidebar-footer .user-name');
    const roleEl = document.querySelector('.sidebar-footer .user-role');
    const avatarEl = document.querySelector('.sidebar-footer .avatar');
    if (nameEl) nameEl.textContent = profile.nombre + ' ' + profile.apellido;
    if (roleEl) roleEl.textContent = profile.rol === 'admin' ? 'Administrador' : 'Editor';
    if (avatarEl) avatarEl.textContent = (profile.nombre[0] || '').toUpperCase();
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span>' + message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ============================================================
// GENERIC SUPABASE OPERATIONS
// ============================================================

async function sbSelect(table, opts = {}) {
    const sb = getSupabase();
    const { columns = '*', filters = {}, order = null, ascending = true, page = 1, pageSize = 10, search = null, searchColumns = [] } = opts;

    let query = sb.from(table).select(columns, { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        if (typeof value === 'boolean') {
            query = query.eq(key, value);
        } else {
            query = query.eq(key, value);
        }
    });

    // Text search
    if (search && searchColumns.length > 0) {
        const orClause = searchColumns.map(col => col + '.ilike.%' + search + '%').join(',');
        query = query.or(orClause);
    }

    // Order
    if (order) {
        query = query.order(order, { ascending });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

async function sbInsert(table, record) {
    const sb = getSupabase();
    const { data, error } = await sb.from(table).insert(record).select().single();
    if (error) throw error;
    return data;
}

async function sbUpdate(table, id, updates) {
    const sb = getSupabase();
    const { data, error } = await sb.from(table).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

async function sbDelete(table, id) {
    const sb = getSupabase();
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw error;
}

async function sbCount(table) {
    const sb = getSupabase();
    const { count, error } = await sb.from(table).select('id', { count: 'exact', head: true });
    if (error) return 0;
    return count || 0;
}

async function sbFetchAll(table, columns = 'id, nombre', orderCol = 'nombre') {
    const sb = getSupabase();
    const { data, error } = await sb.from(table).select(columns).order(orderCol);
    if (error) return [];
    return data || [];
}
