// ============================================================
// API Helper — all calls go through the Express backend
// ============================================================

const API_BASE = '/api';

async function request(path, opts = {}) {
    const { method = 'GET', body, headers = {} } = opts;
    const config = { method, headers: { ...headers } };

    if (body && !(body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
    } else if (body) {
        config.body = body;
    }

    // Attach auth token if present
    const token = sessionStorage.getItem('auth_token');
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }

    const res = await fetch(API_BASE + path, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    return data;
}

// ── Public endpoints ────────────────────────────────────────
export const fetchParametros = () => request('/parametros');
export const fetchAdvocaciones = (params) => {
    const qs = new URLSearchParams(params).toString();
    return request('/advocaciones?' + qs);
};
export const fetchAdvocacion = (slug) => request('/advocaciones/' + slug);
export const fetchContinentes = () => request('/continentes');
export const fetchEstatusCounts = () => request('/estatus-counts');
export const submitContacto = (data) => request('/contacto', { method: 'POST', body: data });

// ── Auth ────────────────────────────────────────────────────
export async function login(email, password) {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } });
    if (data.token) sessionStorage.setItem('auth_token', data.token);
    return data;
}
export function logout() {
    sessionStorage.removeItem('auth_token');
    return request('/auth/logout', { method: 'POST' });
}
export function getProfile() {
    return request('/auth/profile');
}
export function changePassword(currentPassword, newPassword) {
    return request('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword }
    });
}

// ── Admin CRUD ──────────────────────────────────────────────
export const adminList = (table, params) => {
    const qs = new URLSearchParams(params).toString();
    return request('/admin/' + table + '?' + qs);
};
export const adminCreate = (table, record) =>
    request('/admin/' + table, { method: 'POST', body: record });
export const adminUpdate = (table, id, record) =>
    request('/admin/' + table + '/' + id, { method: 'PUT', body: record });
export const adminDelete = (table, id) =>
    request('/admin/' + table + '/' + id, { method: 'DELETE' });
export const adminCount = (table) => request('/admin/' + table + '/count');
export const adminFetchAll = (table) => request('/admin/' + table + '/all');

// ── Upload ──────────────────────────────────────────────────
export async function uploadImage(file, slug) {
    const fd = new FormData();
    fd.append('imagen', file);
    fd.append('slug', slug);
    return request('/upload-image', { method: 'POST', body: fd });
}
