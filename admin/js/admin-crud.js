// ============================================================
// MARIALUX Admin — Generic CRUD Engine
// Renders filters, data grid, modals, and pagination
// ============================================================

let _crudConfig = null;
let _crudState = {
    page: 1,
    sortColumn: null,
    sortAsc: true,
    filters: {},
    data: [],
    count: 0,
    selectedIds: new Set(),
    editingId: null
};

// Foreign key lookup caches
let _fkCache = {};

// ============================================================
// INIT
// ============================================================

async function initCRUD(config) {
    _crudConfig = config;
    _crudState.page = 1;
    _crudState.sortColumn = config.defaultSort || null;
    _crudState.sortAsc = config.defaultSortAsc !== undefined ? config.defaultSortAsc : false;

    // Load FK lookups
    if (config.foreignKeys) {
        for (const fk of config.foreignKeys) {
            _fkCache[fk.key] = await sbFetchAll(fk.table, fk.columns || 'id, nombre', fk.orderBy || 'nombre');
        }
    }

    renderFilters();
    renderToolbar();
    await loadData();
}

// ============================================================
// FILTERS
// ============================================================

function renderFilters() {
    const container = document.getElementById('filter-body');
    if (!container || !_crudConfig.filters) return;

    let html = '<div class="filter-grid">';
    _crudConfig.filters.forEach(f => {
        html += '<div class="form-group">';
        html += '<label for="filter-' + f.key + '">' + f.label + '</label>';

        if (f.type === 'select' && f.fk) {
            const options = _fkCache[f.fk] || [];
            html += '<select id="filter-' + f.key + '">';
            html += '<option value="">Todos</option>';
            options.forEach(o => {
                html += '<option value="' + o.id + '">' + (o.nombre || o.email || o.titulo || '') + '</option>';
            });
            html += '</select>';
        } else if (f.type === 'select' && f.options) {
            html += '<select id="filter-' + f.key + '">';
            html += '<option value="">Todos</option>';
            f.options.forEach(o => {
                const val = typeof o === 'string' ? o : o.value;
                const lbl = typeof o === 'string' ? o : o.label;
                html += '<option value="' + val + '">' + lbl + '</option>';
            });
            html += '</select>';
        } else if (f.type === 'boolean') {
            html += '<select id="filter-' + f.key + '">';
            html += '<option value="">Todos</option>';
            html += '<option value="true">Sí</option>';
            html += '<option value="false">No</option>';
            html += '</select>';
        } else {
            html += '<input type="' + (f.type || 'text') + '" id="filter-' + f.key + '" placeholder="' + (f.placeholder || '') + '">';
        }

        html += '</div>';
    });
    html += '</div>';
    html += '<div class="filter-actions">';
    html += '<button class="btn btn-outline" onclick="clearFilters()">🗑 Limpiar</button>';
    html += '<button class="btn btn-primary" onclick="applyFilters()">🔍 Buscar</button>';
    html += '</div>';

    container.innerHTML = html;
}

function applyFilters() {
    const filters = {};
    _crudConfig.filters.forEach(f => {
        const el = document.getElementById('filter-' + f.key);
        if (!el) return;
        let val = el.value.trim();
        if (val === '') return;
        if (f.type === 'boolean') val = val === 'true';
        filters[f.key] = val;
    });
    _crudState.filters = filters;
    _crudState.page = 1;
    loadData();
}

function clearFilters() {
    _crudConfig.filters.forEach(f => {
        const el = document.getElementById('filter-' + f.key);
        if (el) el.value = '';
    });
    _crudState.filters = {};
    _crudState.page = 1;
    loadData();
}

// ============================================================
// TOOLBAR
// ============================================================

function renderToolbar() {
    const container = document.getElementById('table-toolbar');
    if (!container) return;

    const title = _crudConfig.title || 'Registros';
    container.innerHTML =
        '<div class="toolbar-left">' +
        '<h2>' + title + ' <span class="count-badge" id="total-count">0</span></h2>' +
        '</div>' +
        '<div class="toolbar-right">' +
        '<button class="btn btn-outline btn-sm" onclick="exportCSV()" title="Exportar CSV">📥 CSV</button>' +
        '<button class="btn btn-outline btn-sm" onclick="loadData()" title="Refrescar">🔄</button>' +
        '<button class="btn btn-primary btn-sm" onclick="openCreateModal()">＋ Nuevo</button>' +
        '</div>';
}

// ============================================================
// DATA LOADING
// ============================================================

async function loadData() {
    const tableBody = document.getElementById('table-body');
    const totalCount = document.getElementById('total-count');
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="99"><div class="loading-spinner">Cargando datos...</div></td></tr>';

    try {
        // Separate text search from exact filters
        let searchText = null;
        const exactFilters = {};
        Object.entries(_crudState.filters).forEach(([key, val]) => {
            const filterConf = _crudConfig.filters.find(f => f.key === key);
            if (filterConf && filterConf.searchable) {
                searchText = val;
            } else {
                exactFilters[key] = val;
            }
        });

        const result = await sbSelect(_crudConfig.table, {
            columns: _crudConfig.selectColumns || '*',
            filters: exactFilters,
            order: _crudState.sortColumn,
            ascending: _crudState.sortAsc,
            page: _crudState.page,
            pageSize: _crudConfig.pageSize || 10,
            search: searchText,
            searchColumns: _crudConfig.searchColumns || []
        });

        _crudState.data = result.data;
        _crudState.count = result.count;

        renderTableHeader();
        renderTableBody();
        renderPagination();
        if (totalCount) totalCount.textContent = result.count + ' registros';
    } catch (err) {
        console.error('[CRUD] Error loading:', err);
        showToast('Error al cargar datos: ' + err.message, 'error');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="99"><div class="empty-state"><h3>Error al cargar</h3><p>' + err.message + '</p></div></td></tr>';
    }
}

// ============================================================
// TABLE RENDERING
// ============================================================

function renderTableHeader() {
    const thead = document.getElementById('table-head');
    if (!thead) return;

    let html = '<tr>';
    html += '<th class="row-checkbox"><input type="checkbox" onchange="toggleAllCheckboxes(this)"></th>';
    _crudConfig.columns.forEach(col => {
        const sortClass = _crudState.sortColumn === col.key
            ? (_crudState.sortAsc ? 'sortable sort-asc' : 'sortable sort-desc')
            : (col.sortable ? 'sortable' : '');
        const sortIcon = col.sortable ? '<span class="sort-icon">▲</span>' : '';
        const onclick = col.sortable ? ' onclick="sortBy(\'' + col.key + '\')"' : '';
        html += '<th class="' + sortClass + '"' + onclick + '>' + col.label + sortIcon + '</th>';
    });
    html += '<th>Acciones</th>';
    html += '</tr>';
    thead.innerHTML = html;
}

function renderTableBody() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    if (_crudState.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="99"><div class="empty-state">' +
            '<div class="empty-icon">📋</div>' +
            '<h3>Sin registros</h3>' +
            '<p>No se encontraron registros. Haga clic en "Nuevo" para agregar uno.</p>' +
            '</div></td></tr>';
        return;
    }

    let html = '';
    _crudState.data.forEach(row => {
        const id = row.id;
        const checked = _crudState.selectedIds.has(id) ? ' checked' : '';
        html += '<tr>';
        html += '<td class="row-checkbox"><input type="checkbox" value="' + id + '"' + checked + ' onchange="toggleCheckbox(this)"></td>';
        _crudConfig.columns.forEach(col => {
            html += '<td>' + formatCell(row, col) + '</td>';
        });
        html += '<td class="cell-actions">';
        html += '<button class="btn btn-outline btn-sm btn-icon" onclick="openEditModal(\'' + id + '\')" title="Editar">✏️</button> ';
        html += '<button class="btn btn-outline btn-sm btn-icon" onclick="confirmDelete(\'' + id + '\')" title="Eliminar" style="color:var(--danger)">🗑️</button>';
        html += '</td>';
        html += '</tr>';
    });
    tbody.innerHTML = html;
}

function formatCell(row, col) {
    let value = row[col.key];

    // Handle nested FK values (e.g., paises.nombre)
    if (col.fkDisplay) {
        const parts = col.fkDisplay.split('.');
        let obj = row;
        for (const p of parts) {
            obj = obj ? obj[p] : null;
        }
        value = obj;
    }

    // FK lookup from cache
    if (col.fkLookup) {
        const cache = _fkCache[col.fkLookup];
        if (cache) {
            const found = cache.find(o => o.id === value);
            value = found ? (found.nombre || found.titulo || found.email || value) : value;
        }
    }

    if (value === null || value === undefined) return '<span style="color:var(--text-secondary)">—</span>';

    switch (col.type) {
        case 'date':
            return formatDate(value);
        case 'boolean':
            return value
                ? '<span class="badge badge-success">Sí</span>'
                : '<span class="badge badge-neutral">No</span>';
        case 'badge':
            const badgeClass = col.badgeMap ? (col.badgeMap[value] || 'badge-neutral') : 'badge-info';
            return '<span class="badge ' + badgeClass + '">' + value + '</span>';
        case 'truncate':
            const text = String(value);
            return '<span class="cell-truncate" title="' + escapeHtml(text) + '">' + escapeHtml(text.substring(0, 80)) + (text.length > 80 ? '...' : '') + '</span>';
        case 'image':
            return value ? '<img src="' + value + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px" alt="">' : '—';
        default:
            return escapeHtml(String(value));
    }
}

function formatDate(val) {
    if (!val) return '—';
    const d = new Date(val);
    return d.toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// SORTING
// ============================================================

function sortBy(column) {
    if (_crudState.sortColumn === column) {
        _crudState.sortAsc = !_crudState.sortAsc;
    } else {
        _crudState.sortColumn = column;
        _crudState.sortAsc = true;
    }
    loadData();
}

// ============================================================
// CHECKBOXES
// ============================================================

function toggleAllCheckboxes(el) {
    const checked = el.checked;
    _crudState.selectedIds.clear();
    if (checked) {
        _crudState.data.forEach(row => _crudState.selectedIds.add(row.id));
    }
    document.querySelectorAll('#table-body input[type="checkbox"]').forEach(cb => cb.checked = checked);
}

function toggleCheckbox(el) {
    if (el.checked) {
        _crudState.selectedIds.add(el.value);
    } else {
        _crudState.selectedIds.delete(el.value);
    }
}

// ============================================================
// PAGINATION
// ============================================================

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const pageSize = _crudConfig.pageSize || 10;
    const totalPages = Math.ceil(_crudState.count / pageSize);
    const current = _crudState.page;
    const from = (_crudState.count === 0) ? 0 : (current - 1) * pageSize + 1;
    const to = Math.min(current * pageSize, _crudState.count);

    let html = '<div class="page-info">' + from + '–' + to + ' de ' + _crudState.count + ' registros</div>';
    html += '<div class="page-controls">';
    html += '<button class="page-btn" onclick="goToPage(1)"' + (current <= 1 ? ' disabled' : '') + '>«</button>';
    html += '<button class="page-btn" onclick="goToPage(' + (current - 1) + ')"' + (current <= 1 ? ' disabled' : '') + '>‹</button>';

    // Show max 5 page buttons around current
    let startP = Math.max(1, current - 2);
    let endP = Math.min(totalPages, startP + 4);
    startP = Math.max(1, endP - 4);

    for (let i = startP; i <= endP; i++) {
        html += '<button class="page-btn' + (i === current ? ' active' : '') + '" onclick="goToPage(' + i + ')">' + i + '</button>';
    }

    html += '<button class="page-btn" onclick="goToPage(' + (current + 1) + ')"' + (current >= totalPages ? ' disabled' : '') + '>›</button>';
    html += '<button class="page-btn" onclick="goToPage(' + totalPages + ')"' + (current >= totalPages ? ' disabled' : '') + '>»</button>';
    html += '</div>';

    container.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(_crudState.count / (_crudConfig.pageSize || 10));
    if (page < 1 || page > totalPages) return;
    _crudState.page = page;
    loadData();
}

// ============================================================
// MODAL — CREATE / EDIT
// ============================================================

function openCreateModal() {
    _crudState.editingId = null;
    renderFormModal('Nuevo ' + (_crudConfig.singularTitle || 'Registro'), {});
}

function openEditModal(id) {
    const row = _crudState.data.find(r => String(r.id) === String(id));
    if (!row) return;
    _crudState.editingId = id;
    renderFormModal('Editar ' + (_crudConfig.singularTitle || 'Registro'), row);
}

function renderFormModal(title, data) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    let bodyHtml = '<div class="form-row">';
    _crudConfig.formFields.forEach(f => {
        const val = data[f.key] !== undefined && data[f.key] !== null ? data[f.key] : (f.default || '');
        bodyHtml += '<div class="form-group">';
        bodyHtml += '<label for="field-' + f.key + '">' + f.label + (f.required ? ' *' : '') + '</label>';

        if (f.type === 'select' && f.fk) {
            const options = _fkCache[f.fk] || [];
            bodyHtml += '<select id="field-' + f.key + '"' + (f.required ? ' required' : '') + '>';
            bodyHtml += '<option value="">Seleccionar...</option>';
            options.forEach(o => {
                const sel = o.id === val ? ' selected' : '';
                bodyHtml += '<option value="' + o.id + '"' + sel + '>' + (o.nombre || o.titulo || o.email || '') + '</option>';
            });
            bodyHtml += '</select>';
        } else if (f.type === 'select' && f.options) {
            bodyHtml += '<select id="field-' + f.key + '"' + (f.required ? ' required' : '') + '>';
            bodyHtml += '<option value="">Seleccionar...</option>';
            f.options.forEach(o => {
                const optVal = typeof o === 'string' ? o : o.value;
                const optLbl = typeof o === 'string' ? o : o.label;
                const sel = optVal === String(val) ? ' selected' : '';
                bodyHtml += '<option value="' + optVal + '"' + sel + '>' + optLbl + '</option>';
            });
            bodyHtml += '</select>';
        } else if (f.type === 'textarea') {
            bodyHtml += '<textarea id="field-' + f.key + '" rows="' + (f.rows || 3) + '"' + (f.required ? ' required' : '') + '>' + escapeHtml(String(val)) + '</textarea>';
        } else if (f.type === 'checkbox') {
            bodyHtml += '<input type="checkbox" id="field-' + f.key + '"' + (val ? ' checked' : '') + ' style="width:auto;margin-top:6px">';
        } else if (f.type === 'file_upload') {
            bodyHtml += '<div class="file-upload-group">';
            bodyHtml += '<div style="display:flex;gap:8px;align-items:center">';
            bodyHtml += '<input type="text" id="field-' + f.key + '" value="' + escapeHtml(String(val)) + '" readonly style="flex:1;background:var(--bg-secondary);cursor:default">';
            bodyHtml += '<button type="button" class="btn btn-outline btn-sm" onclick="triggerFileUpload(\'' + f.key + '\', \'' + (f.nameField || 'slug') + '\')" style="white-space:nowrap">📷 Subir</button>';
            bodyHtml += '</div>';
            bodyHtml += '<input type="file" id="file-input-' + f.key + '" accept="image/*" style="display:none" onchange="handleFileUpload(\'' + f.key + '\', \'' + (f.nameField || 'slug') + '\')">';
            if (val) {
                bodyHtml += '<div id="file-preview-' + f.key + '" style="margin-top:8px"><img src="' + escapeHtml(String(val)) + '" style="max-height:120px;border-radius:8px;border:1px solid var(--border-color)" onerror="this.style.display=\'none\'"></div>';
            } else {
                bodyHtml += '<div id="file-preview-' + f.key + '" style="margin-top:8px"></div>';
            }
            bodyHtml += '</div>';
        } else if (f.type === 'number') {
            bodyHtml += '<input type="number" id="field-' + f.key + '" value="' + escapeHtml(String(val)) + '"' + (f.required ? ' required' : '') + '>';
        } else {
            bodyHtml += '<input type="' + (f.type || 'text') + '" id="field-' + f.key + '" value="' + escapeHtml(String(val)) + '"' + (f.required ? ' required' : '') + '>';
        }

        if (f.help) {
            bodyHtml += '<span class="help-text">' + f.help + '</span>';
        }
        bodyHtml += '</div>';
    });
    bodyHtml += '</div>';

    overlay.innerHTML =
        '<div class="modal">' +
        '<div class="modal-header">' +
        '<h3>' + title + '</h3>' +
        '<button class="modal-close" onclick="closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>' +
        '<button class="btn btn-primary" onclick="saveRecord()" id="btn-save">💾 Guardar</button>' +
        '</div>' +
        '</div>';

    overlay.classList.add('active');
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

async function saveRecord() {
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando...'; }

    try {
        const record = {};
        _crudConfig.formFields.forEach(f => {
            const el = document.getElementById('field-' + f.key);
            if (!el) return;
            if (f.type === 'checkbox') {
                record[f.key] = el.checked;
            } else if (f.type === 'number') {
                record[f.key] = el.value ? Number(el.value) : null;
            } else {
                record[f.key] = el.value.trim() || null;
            }
        });

        if (_crudState.editingId) {
            await sbUpdate(_crudConfig.table, _crudState.editingId, record);
            showToast('Registro actualizado correctamente', 'success');
        } else {
            await sbInsert(_crudConfig.table, record);
            showToast('Registro creado correctamente', 'success');
        }

        closeModal();
        await loadData();
    } catch (err) {
        console.error('[CRUD] Save error:', err);
        showToast('Error: ' + err.message, 'error');
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '💾 Guardar'; }
    }
}

// ============================================================
// DELETE
// ============================================================

function confirmDelete(id) {
    const row = _crudState.data.find(r => String(r.id) === String(id));
    const name = row ? (row.nombre || row.clave || row.titulo || row.email || row.id) : id;

    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    overlay.innerHTML =
        '<div class="modal" style="max-width:440px">' +
        '<div class="modal-header">' +
        '<h3>Confirmar eliminación</h3>' +
        '<button class="modal-close" onclick="closeModal()">✕</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<p class="confirm-text">¿Está seguro de que desea eliminar <strong>' + escapeHtml(String(name)) + '</strong>?</p>' +
        '<p class="confirm-text">Esta acción no se puede deshacer.</p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>' +
        '<button class="btn btn-danger" onclick="executeDelete(\'' + id + '\')">🗑 Eliminar</button>' +
        '</div>' +
        '</div>';

    overlay.classList.add('active');
}

async function executeDelete(id) {
    try {
        await sbDelete(_crudConfig.table, id);
        showToast('Registro eliminado', 'success');
        closeModal();
        await loadData();
    } catch (err) {
        showToast('Error al eliminar: ' + err.message, 'error');
    }
}

// ============================================================
// EXPORT CSV
// ============================================================

function exportCSV() {
    if (_crudState.data.length === 0) {
        showToast('No hay datos para exportar', 'info');
        return;
    }
    const columns = _crudConfig.columns;
    const headers = columns.map(c => c.label).join(',');
    const rows = _crudState.data.map(row => {
        return columns.map(col => {
            let val = row[col.key];
            if (val === null || val === undefined) val = '';
            val = String(val).replace(/"/g, '""');
            return '"' + val + '"';
        }).join(',');
    });

    const csv = headers + '\n' + rows.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = _crudConfig.table + '_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado correctamente', 'success');
}

// ============================================================
// FILTER TOGGLE
// ============================================================

function toggleFilters() {
    const card = document.querySelector('.filter-card');
    if (card) card.classList.toggle('collapsed');
}

// ============================================================
// FILE UPLOAD (for file_upload field type)
// ============================================================

function triggerFileUpload(fieldKey, nameField) {
    const slugEl = document.getElementById('field-' + nameField);
    if (!slugEl || !slugEl.value.trim()) {
        showToast('Primero complete el campo "' + nameField + '" antes de subir una imagen', 'error');
        return;
    }
    const fileInput = document.getElementById('file-input-' + fieldKey);
    if (fileInput) fileInput.click();
}

async function handleFileUpload(fieldKey, nameField) {
    const fileInput = document.getElementById('file-input-' + fieldKey);
    const field = document.getElementById('field-' + fieldKey);
    const slugEl = document.getElementById('field-' + nameField);

    if (!fileInput || !fileInput.files[0] || !slugEl) return;

    const file = fileInput.files[0];
    const slug = slugEl.value.trim();

    if (!slug) {
        showToast('El slug es requerido para nombrar el archivo', 'error');
        return;
    }

    // Show uploading state
    if (field) field.value = 'Subiendo...';

    try {
        const formData = new FormData();
        formData.append('imagen', file);
        formData.append('slug', slug);

        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al subir imagen');
        }

        // Update the field with the relative path
        if (field) field.value = result.path;

        // Update preview
        const preview = document.getElementById('file-preview-' + fieldKey);
        if (preview) {
            preview.innerHTML = '<img src="/' + result.path + '?t=' + Date.now() + '" style="max-height:120px;border-radius:8px;border:1px solid var(--border-color)">';
        }

        showToast('Imagen subida correctamente: ' + result.path, 'success');
    } catch (err) {
        console.error('[Upload] Error:', err);
        if (field) field.value = '';
        showToast('Error al subir imagen: ' + err.message, 'error');
    }

    // Reset file input
    fileInput.value = '';
}
