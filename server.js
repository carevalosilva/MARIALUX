// ============================================================
// MARIALUX — Express API Server
// All Supabase logic is encapsulated here.
// Frontend only receives rendered data, no direct DB access.
// ============================================================

import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase Client ─────────────────────────────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.use(express.json());

// ── Image upload config ─────────────────────────────────────
const VIRGENES_DIR = path.join(__dirname, 'virgenes');
if (!fs.existsSync(VIRGENES_DIR)) fs.mkdirSync(VIRGENES_DIR, { recursive: true });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;
        cb(null, allowed.test(path.extname(file.originalname)));
    }
});

// ── Helper: parse auth token ────────────────────────────────
function getAuthToken(req) {
    const h = req.headers.authorization;
    return h ? h.replace('Bearer ', '') : null;
}

async function getAuthClient(req) {
    const token = getAuthToken(req);
    if (!token) return null;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

// GET /api/parametros
app.get('/api/parametros', async (req, res) => {
    const { data, error } = await supabase.from('parametros_sitio').select('clave, valor');
    if (error) return res.status(500).json({ error: error.message });
    const params = {};
    (data || []).forEach(r => { params[r.clave] = r.valor; });
    res.json(params);
});

// GET /api/continentes
app.get('/api/continentes', async (req, res) => {
    const { data, error } = await supabase.from('continentes').select('id, nombre, slug').order('nombre');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// GET /api/estatus-counts
app.get('/api/estatus-counts', async (req, res) => {
    const { data, error } = await supabase.from('advocaciones').select('estatus_eclesiastico').eq('publicado', true);
    if (error) return res.status(500).json({ error: error.message });
    const counts = {};
    (data || []).forEach(r => { counts[r.estatus_eclesiastico] = (counts[r.estatus_eclesiastico] || 0) + 1; });
    res.json(counts);
});

// GET /api/advocaciones?page=1&pageSize=12&continente=...&siglo=...&tipoOrigen=...&estatus=...&search=...&orderBy=anio&ascending=true
app.get('/api/advocaciones', async (req, res) => {
    try {
        const { page = 1, pageSize = 12, continente, siglo, tipoOrigen, estatus, search, orderBy = 'anio', ascending = 'true' } = req.query;
        const from = (parseInt(page) - 1) * parseInt(pageSize);
        const to = from + parseInt(pageSize) - 1;

        let selectQuery = `id, nombre, slug, descripcion_corta, siglo, anio, tipo_origen, estatus_eclesiastico, imagen_url,
      paises!inner(nombre, slug, continente_id, continentes!inner(nombre, slug))`;

        let query = supabase.from('advocaciones').select(selectQuery, { count: 'exact' }).eq('publicado', true);

        if (continente) query = query.eq('paises.continentes.slug', continente);
        if (tipoOrigen) query = query.eq('tipo_origen', tipoOrigen);
        if (estatus) query = query.eq('estatus_eclesiastico', estatus);
        if (siglo) query = query.eq('siglo', siglo);
        if (search) {
            // Accent-insensitive search via PostgreSQL unaccent() function
            const { data: matchIds, error: rpcError } = await supabase
                .rpc('search_advocaciones', { search_text: search })
                .select('id');
            if (!rpcError && matchIds && matchIds.length > 0) {
                query = query.in('id', matchIds.map(r => r.id));
            } else if (rpcError) {
                // Fallback to regular ilike if RPC not available
                query = query.or(`nombre.ilike.%${search}%,descripcion_corta.ilike.%${search}%`);
            } else {
                // No results from unaccent search
                return res.json({ data: [], count: 0 });
            }
        }

        query = query.order(orderBy, { ascending: ascending === 'true' }).range(from, to);

        const { data, error, count } = await query;
        if (error) return res.status(500).json({ error: error.message });

        res.json({ data: data || [], count: count || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/advocaciones/:slug
app.get('/api/advocaciones/:slug', async (req, res) => {
    const { data, error } = await supabase
        .from('advocaciones')
        .select(`*, paises(nombre, slug, codigo_iso, continentes(nombre, slug)),
      iconografia_items(id, titulo, descripcion, orden),
      referencias_doctrinales(id, fuente, titulo, cita, orden)`)
        .eq('slug', req.params.slug)
        .eq('publicado', true)
        .order('orden', { referencedTable: 'iconografia_items', ascending: true })
        .order('orden', { referencedTable: 'referencias_doctrinales', ascending: true })
        .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Advocación no encontrada' });
    res.json(data);
});

// POST /api/contacto
app.post('/api/contacto', async (req, res) => {
    try {
        const { nombre, email, asunto, mensaje } = req.body;

        // Validate required fields
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ error: 'Los campos nombre, email y mensaje son obligatorios.' });
        }

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'El formato de email no es válido.' });
        }

        // Insert into formularios_contacto
        const { error } = await supabase
            .from('formularios_contacto')
            .insert({ nombre, email, asunto: asunto || null, mensaje });

        if (error) return res.status(500).json({ error: error.message });

        // Send notification email via Resend
        try {
            const { data: paramData } = await supabase
                .from('parametros_sitio')
                .select('valor')
                .eq('clave', 'email_contacto')
                .single();

            const destinationEmail = paramData?.valor;

            if (destinationEmail && process.env.RESEND_API_KEY) {
                console.log(`📧 Sending email to ${destinationEmail}...`);
                const emailRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'REGINAPACIS <onboarding@resend.dev>',
                        to: [destinationEmail],
                        subject: `Nuevo mensaje de contacto: ${asunto || 'Sin asunto'}`,
                        html: `
                            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
                                <div style="background: linear-gradient(135deg, #1a365d, #2d3748); padding: 32px 24px; text-align: center;">
                                    <h1 style="color: #fff; font-size: 24px; margin: 0;">✝ REGINAPACIS</h1>
                                    <p style="color: #a0aec0; font-size: 13px; margin: 8px 0 0;">Nuevo mensaje de contacto</p>
                                </div>
                                <div style="padding: 32px 24px;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096; font-size: 13px; width: 100px;">Nombre</td>
                                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c; font-weight: 600;">${nombre}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096; font-size: 13px;">Email</td>
                                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c;">${email}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096; font-size: 13px;">Asunto</td>
                                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c;">${asunto || 'Sin asunto'}</td>
                                        </tr>
                                    </table>
                                    <div style="margin-top: 24px; padding: 20px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <p style="color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Mensaje</p>
                                        <p style="color: #2d3748; line-height: 1.7; margin: 0; white-space: pre-wrap;">${mensaje}</p>
                                    </div>
                                </div>
                                <div style="padding: 16px 24px; background: #edf2f7; text-align: center;">
                                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">Este mensaje fue enviado desde el formulario de contacto de REGINAPACIS</p>
                                </div>
                            </div>
                        `
                    })
                });
                const emailResult = await emailRes.json();
                console.log('📧 Resend response:', emailRes.status, JSON.stringify(emailResult));
            } else {
                console.log('📧 Email not sent: destinationEmail=', destinationEmail, 'RESEND_API_KEY=', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
            }
        } catch (emailErr) {
            // Log email error but don't fail the request
            console.error('📧 Error sending email:', emailErr.message);
        }

        res.json({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// AUTH ENDPOINTS
// ============================================================

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    res.json({ token: data.session.access_token, user: data.user });
});

app.post('/api/auth/logout', async (req, res) => {
    res.json({ success: true });
});

app.get('/api/auth/profile', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).maybeSingle();
    res.json(data || { id: user.id, nombre: user.email.split('@')[0], email: user.email, rol: 'admin' });
});

app.post('/api/auth/change-password', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Faltan datos requeridos (contraseña actual y nueva)' });
    }

    // 1. Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
    });

    if (signInError) {
        return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
            error: 'Servidor no configurado para cambio de contraseñas (falta SERVICE_ROLE_KEY)'
        });
    }

    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 2. Update password
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, {
        password: newPassword
    });

    if (updateError) {
        return res.status(500).json({ error: updateError.message });
    }

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
});

// ============================================================
// ADMIN CRUD ENDPOINTS
// ============================================================

// GET /api/admin/:table?page=1&pageSize=10&sort=nombre&asc=true&search=texto&filters=json
app.get('/api/admin/:table', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const table = req.params.table;
    const { page = 1, pageSize = 10, sort, asc = 'true', search, searchColumns, filters } = req.query;
    const from = (parseInt(page) - 1) * parseInt(pageSize);
    const to = from + parseInt(pageSize) - 1;

    let query = supabase.from(table).select('*', { count: 'exact' });

    // Apply exact filters
    if (filters) {
        try {
            const f = JSON.parse(filters);
            Object.entries(f).forEach(([key, val]) => {
                if (val !== '' && val !== null && val !== undefined) {
                    if (val === 'true') query = query.eq(key, true);
                    else if (val === 'false') query = query.eq(key, false);
                    else query = query.eq(key, val);
                }
            });
        } catch (e) { /* ignore parse errors */ }
    }

    // Text search
    if (search && searchColumns) {
        const cols = searchColumns.split(',');
        const orClause = cols.map(c => `${c}.ilike.%${search}%`).join(',');
        query = query.or(orClause);
    }

    // Sort
    if (sort) {
        query = query.order(sort, { ascending: asc === 'true' });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data: data || [], count: count || 0 });
});

// GET /api/admin/:table/count
app.get('/api/admin/:table/count', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const { count, error } = await supabase.from(req.params.table).select('id', { count: 'exact', head: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ count: count || 0 });
});

// GET /api/admin/:table/all
app.get('/api/admin/:table/all', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const { data, error } = await supabase.from(req.params.table).select('id, nombre').order('nombre');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// POST /api/admin/usuarios (Special handler for users)
app.post('/api/admin/usuarios', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const { email, nombre, apellido, rol, password = 'PasswordTemporal123!' } = req.body;

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
            error: 'Para crear usuarios desde el panel, necesitas configurar SUPABASE_SERVICE_ROLE_KEY en el archivo .env con la clave secreta (service_role) de Supabase.'
        });
    }

    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        // 1. Create user in Auth
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) return res.status(500).json({ error: authError.message });

        // 2. Insert into public.usuarios table
        const { data, error } = await adminSupabase.from('usuarios').insert({
            id: authData.user.id,
            email,
            nombre,
            apellido,
            rol
        }).select().single();

        if (error) {
            await adminSupabase.auth.admin.deleteUser(authData.user.id);
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/:table
app.post('/api/admin/:table', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : supabase;

    const { data, error } = await client.from(req.params.table).insert(req.body).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// PUT /api/admin/:table/:id
app.put('/api/admin/:table/:id', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : supabase;

    const { data, error } = await client.from(req.params.table).update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// DELETE /api/admin/:table/:id
app.delete('/api/admin/:table/:id', async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    const client = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : supabase;

    const { error } = await client.from(req.params.table).delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// ============================================================
// IMAGE UPLOAD
// ============================================================

app.post('/api/upload-image', upload.single('imagen'), async (req, res) => {
    const user = await getAuthClient(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });

    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
    const slug = req.body.slug;
    if (!slug) return res.status(400).json({ error: 'El campo slug es requerido' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = slug + ext;
    fs.writeFileSync(path.join(VIRGENES_DIR, filename), req.file.buffer);

    res.json({ success: true, path: 'virgenes/' + filename });
});

// ============================================================
// STATIC FILES (production: serve Vite build)
// ============================================================

// Always serve virgenes/ images
app.use('/virgenes', express.static(VIRGENES_DIR));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve favicon
app.get('/favicon.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon.svg'));
});

// In production, serve the Vite build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('  ✝  MARIALUX API Server');
    console.log('  ─────────────────────────');
    console.log(`  🌐 http://localhost:${PORT}`);
    console.log(`  📷 Upload: POST /api/upload-image`);
    console.log('');
});
