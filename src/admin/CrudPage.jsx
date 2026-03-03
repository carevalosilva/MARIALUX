import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { adminList, adminCreate, adminUpdate, adminDelete, adminFetchAll, uploadImage } from '../api';

// ── Field configs per table ─────────────────────────────────
const ESTATUS = ['Culto Universal', 'Aprobación Pontificia', 'Coronación Pontificia', 'Patrona Nacional', 'Culto Local', 'Aparición aprobada por la Santa Sede', 'En estudio'];
const TIPOS_ORIGEN = ['Aparición', 'Imagen Hallada', 'Patronazgo Histórico', 'Iconografía Dogmática'];

const FIELD_CONFIGS = {
    advocaciones: {
        columns: ['nombre', 'slug', 'siglo', 'estatus_eclesiastico', 'publicado'],
        searchColumns: 'nombre,slug',
        formFields: [
            { key: 'nombre', label: 'Nombre', required: true },
            { key: 'slug', label: 'Slug', required: true },
            { key: 'descripcion_corta', label: 'Descripción Corta', type: 'textarea' },
            { key: 'pais_id', label: 'País', type: 'fk', fkTable: 'paises' },
            { key: 'siglo', label: 'Siglo' },
            { key: 'anio', label: 'Año', type: 'number' },
            { key: 'festividad', label: 'Festividad' },
            { key: 'tipo_origen', label: 'Tipo Origen', type: 'select', options: TIPOS_ORIGEN, required: true },
            { key: 'estatus_eclesiastico', label: 'Estatus', type: 'select', options: ESTATUS, required: true },
            { key: 'imagen_url', label: 'Imagen', type: 'file_upload', nameField: 'slug' },
            { key: 'imagen_caption', label: 'Caption de Imagen' },
            { key: 'historia', label: 'Historia', type: 'textarea', rows: 4 },
            { key: 'significado_espiritual', label: 'Significado Espiritual', type: 'textarea', rows: 3 },
            { key: 'cita_destacada', label: 'Cita Destacada', type: 'textarea', rows: 2 },
            { key: 'notas_doctrinales', label: 'Notas Doctrinales', type: 'textarea', rows: 3 },
            { key: 'fuentes', label: 'Fuentes', type: 'textarea', rows: 2 },
            { key: 'publicado', label: 'Publicado', type: 'checkbox', default: true },
        ],
    },
    continentes: {
        columns: ['nombre', 'slug'],
        searchColumns: 'nombre,slug',
        formFields: [
            { key: 'nombre', label: 'Nombre', required: true },
            { key: 'slug', label: 'Slug', required: true },
        ],
    },
    paises: {
        columns: ['nombre', 'slug', 'codigo_iso'],
        searchColumns: 'nombre,slug',
        formFields: [
            { key: 'nombre', label: 'Nombre', required: true },
            { key: 'slug', label: 'Slug', required: true },
            { key: 'codigo_iso', label: 'Código ISO' },
            { key: 'continente_id', label: 'Continente', type: 'fk', fkTable: 'continentes', required: true },
        ],
    },
    iconografia_items: {
        columns: ['titulo', 'descripcion', 'orden'],
        searchColumns: 'titulo,descripcion',
        formFields: [
            { key: 'advocacion_id', label: 'Advocación', type: 'fk', fkTable: 'advocaciones', required: true },
            { key: 'titulo', label: 'Título', required: true },
            { key: 'descripcion', label: 'Descripción', type: 'textarea', rows: 3 },
            { key: 'orden', label: 'Orden', type: 'number', default: 0 },
        ],
    },
    referencias_doctrinales: {
        columns: ['fuente', 'titulo', 'cita'],
        searchColumns: 'fuente,titulo',
        formFields: [
            { key: 'advocacion_id', label: 'Advocación', type: 'fk', fkTable: 'advocaciones', required: true },
            { key: 'fuente', label: 'Fuente', required: true },
            { key: 'titulo', label: 'Título' },
            { key: 'cita', label: 'Cita', type: 'textarea', rows: 3 },
            { key: 'orden', label: 'Orden', type: 'number', default: 0 },
        ],
    },
    usuarios: {
        columns: ['nombre', 'apellido', 'email', 'rol'],
        searchColumns: 'nombre,apellido,email',
        formFields: [
            { key: 'nombre', label: 'Nombre', required: true },
            { key: 'apellido', label: 'Apellido', required: true },
            { key: 'email', label: 'Email', required: true },
            { key: 'rol', label: 'Rol', type: 'select', options: ['admin', 'editor', 'viewer'], required: true },
        ],
    },
    parametros_sitio: {
        columns: ['clave', 'valor', 'descripcion'],
        searchColumns: 'clave,valor',
        formFields: [
            { key: 'clave', label: 'Clave', required: true },
            { key: 'valor', label: 'Valor', type: 'textarea', rows: 2 },
            { key: 'descripcion', label: 'Descripción' },
        ],
    },
};

// ── Toast helper ────────────────────────────────────────────
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`toast ${type}`}>{message}</div>
    );
}

// ============================================================
// CRUD PAGE
// ============================================================
export default function CrudPage({ config }) {
    const { path, table, title, singular } = config;
    const fieldConfig = FIELD_CONFIGS[table] || { columns: ['id'], formFields: [], searchColumns: '' };

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [asc, setAsc] = useState(true);
    const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
    const [editData, setEditData] = useState({});
    const [deleteId, setDeleteId] = useState(null);
    const [fkCache, setFkCache] = useState({});
    const [toast, setToast] = useState(null);
    const [uploading, setUploading] = useState(false);

    const pageSize = 10;

    // Load foreign key data
    useEffect(() => {
        const fkTables = new Set();
        fieldConfig.formFields.forEach(f => { if (f.fkTable) fkTables.add(f.fkTable); });
        fkTables.forEach(t => {
            adminFetchAll(t).then(data => {
                setFkCache(c => ({ ...c, [t]: data }));
            }).catch(() => { });
        });
    }, [table]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, pageSize, sort, asc: String(asc), search, searchColumns: fieldConfig.searchColumns };
            const r = await adminList(table, params);
            setRows(r.data);
            setTotal(r.count);
        } catch (e) {
            showToast(e.message, 'error');
        }
        setLoading(false);
    }, [table, page, sort, asc, search]);

    useEffect(() => { load(); }, [load]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const handleSort = (col) => {
        if (sort === col) setAsc(!asc);
        else { setSort(col); setAsc(true); }
    };

    const openCreate = () => {
        const defaults = {};
        fieldConfig.formFields.forEach(f => { defaults[f.key] = f.default ?? ''; });
        setEditData(defaults);
        setModal('create');
    };

    const openEdit = (row) => {
        setEditData({ ...row });
        setModal('edit');
    };

    const openDelete = (id) => {
        setDeleteId(id);
        setModal('delete');
    };

    const handleSave = async () => {
        try {
            const record = {};
            fieldConfig.formFields.forEach(f => {
                if (f.type === 'checkbox') record[f.key] = editData[f.key] || false;
                else if (f.type === 'number') record[f.key] = editData[f.key] !== '' ? Number(editData[f.key]) : null;
                else record[f.key] = editData[f.key] || null;
            });

            if (modal === 'create') {
                await adminCreate(table, record);
                showToast(`${singular} creado correctamente`);
            } else {
                await adminUpdate(table, editData.id, record);
                showToast(`${singular} actualizado correctamente`);
            }
            setModal(null);
            load();
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await adminDelete(table, deleteId);
            showToast(`${singular} eliminado correctamente`);
            setModal(null);
            load();
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    const handleUpload = async (fieldKey, nameField) => {
        const slugVal = editData[nameField];
        if (!slugVal) { showToast('Primero complete el campo slug', 'error'); return; }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploading(true);
            try {
                const result = await uploadImage(file, slugVal);
                setEditData(d => ({ ...d, [fieldKey]: result.path }));
                showToast('Imagen subida: ' + result.path);
            } catch (err) {
                showToast('Error: ' + err.message, 'error');
            }
            setUploading(false);
        };
        input.click();
    };

    const totalPages = Math.ceil(total / pageSize);

    // ── Render field input ──────────────────────────────────
    const renderField = (f) => {
        const val = editData[f.key] ?? '';

        if (f.type === 'select' && f.options) {
            return (
                <select value={val} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))} required={f.required}>
                    <option value="">Seleccionar...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            );
        }
        if (f.type === 'fk') {
            const options = fkCache[f.fkTable] || [];
            return (
                <select value={val} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))} required={f.required}>
                    <option value="">Seleccionar...</option>
                    {options.map(o => <option key={o.id} value={o.id}>{o.nombre || o.titulo || o.email}</option>)}
                </select>
            );
        }
        if (f.type === 'textarea') {
            return <textarea rows={f.rows || 3} value={val} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))} required={f.required} />;
        }
        if (f.type === 'checkbox') {
            return <input type="checkbox" checked={!!val} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.checked }))} style={{ width: 'auto', marginTop: 6 }} />;
        }
        if (f.type === 'file_upload') {
            return (
                <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="text" value={val} readOnly style={{ flex: 1, background: '#f8fafc', cursor: 'default' }} />
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleUpload(f.key, f.nameField || 'slug')} disabled={uploading}>
                            {uploading ? '⏳' : '📷'} Subir
                        </button>
                    </div>
                    {val && <img src={'/' + val + '?t=' + Date.now()} style={{ maxHeight: 100, borderRadius: 8, marginTop: 8 }} onError={e => e.target.style.display = 'none'} />}
                </div>
            );
        }
        if (f.type === 'number') {
            return <input type="number" value={val} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))} required={f.required} />;
        }
        return <input type="text" value={val} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))} required={f.required} />;
    };

    return (
        <AdminLayout title={title} section={title}>
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                </div>
            )}

            <div className="card">
                {/* Toolbar */}
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <h2>{title} <span className="count-badge">{total}</span></h2>
                    </div>
                    <div className="toolbar-right">
                        <input type="text" placeholder="Buscar..." className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                        <button className="btn btn-primary" onClick={openCreate}>
                            <span className="material-icons-outlined" style={{ fontSize: 16 }}>add</span>
                            Nuevo {singular}
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="loading-spinner">Cargando...</div>
                ) : rows.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Sin registros</h3>
                        <p>No hay datos para mostrar</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {fieldConfig.columns.map(col => (
                                    <th key={col} className="sortable" onClick={() => handleSort(col)}>
                                        {col.replace(/_/g, ' ')}
                                        <span className="sort-icon">▲</span>
                                    </th>
                                ))}
                                <th style={{ width: 100 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.id}>
                                    {fieldConfig.columns.map(col => (
                                        <td key={col}>
                                            {typeof row[col] === 'boolean' ? (
                                                <span className={`badge ${row[col] ? 'badge-success' : 'badge-neutral'}`}>{row[col] ? 'Sí' : 'No'}</span>
                                            ) : (
                                                <span className="cell-truncate">{String(row[col] ?? '—')}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="cell-actions">
                                        <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(row)} title="Editar">
                                            <span className="material-icons-outlined" style={{ fontSize: 14 }}>edit</span>
                                        </button>
                                        <button className="btn btn-outline btn-icon btn-sm" onClick={() => openDelete(row.id)} title="Eliminar" style={{ marginLeft: 4, color: '#ef4444' }}>
                                            <span className="material-icons-outlined" style={{ fontSize: 14 }}>delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="page-info">Mostrando {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} de {total}</div>
                        <div className="page-controls">
                            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                            ))}
                            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Create/Edit */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{modal === 'create' ? `Crear ${singular}` : `Editar ${singular}`}</h3>
                            <button className="modal-close" onClick={() => setModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                {fieldConfig.formFields.map(f => (
                                    <div className="form-group" key={f.key}>
                                        <label>{f.label}{f.required ? ' *' : ''}</label>
                                        {renderField(f)}
                                        {f.help && <span className="help-text">{f.help}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {modal === 'create' ? 'Crear' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Delete */}
            {modal === 'delete' && (
                <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setModal(null)}>
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3>Confirmar eliminación</h3>
                            <button className="modal-close" onClick={() => setModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="confirm-text">¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
