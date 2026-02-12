// ============================================================
// MARIALUX — Supabase Client & Data Access Layer
// ============================================================

const SUPABASE_URL = 'https://abkseebmtwmfxmrgiqgr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia3NlZWJtdHdtZnhtcmdpcWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzQwODIsImV4cCI6MjA4NjQxMDA4Mn0.4C0l888NPcbCnX3Eb1aYRa5AcscBdUWn7gtnMXOa0aY';

let _supabaseClient = null;
let _supabaseReady = false;

function getSupabase() {
    if (_supabaseClient) return _supabaseClient;

    // The CDN exposes supabase globally
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        _supabaseReady = true;
        console.log('[MARIALUX] Supabase client initialized');
        return _supabaseClient;
    }

    console.warn('[MARIALUX] Supabase JS library not yet available');
    return null;
}

/**
 * Ensures Supabase is ready before making calls.
 * Returns the client or throws.
 */
function requireSupabase() {
    const sb = getSupabase();
    if (!sb) {
        throw new Error('Supabase client not initialized. Check CDN script tag.');
    }
    return sb;
}

// ============================================================
// DATA ACCESS: Advocaciones
// ============================================================

/**
 * Obtener lista de advocaciones para el explorador con filtros
 */
async function fetchAdvocaciones(opts) {
    try {
        const {
            page = 1,
            pageSize = 12,
            continente = null,
            siglo = null,
            tipoOrigen = null,
            estatus = null,
            search = '',
            orderBy = 'anio',
            ascending = true
        } = opts || {};

        const sb = requireSupabase();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Use !inner joins to allow filtering by related tables (continents)
        // This ensures the count and pagination are correct on the server side
        let selectQuery = `
            id, nombre, slug, descripcion_corta, siglo, anio,
            tipo_origen, estatus_eclesiastico, imagen_url,
            paises!inner(nombre, slug, continente_id, continentes!inner(nombre, slug))
        `;

        let query = sb
            .from('advocaciones')
            .select(selectQuery, { count: 'exact' })
            .eq('publicado', true);

        // Filtro por continente (Server-side)
        if (continente) {
            query = query.eq('paises.continentes.slug', continente);
        }

        // Filtro por tipo de origen
        if (tipoOrigen) {
            query = query.eq('tipo_origen', tipoOrigen);
        }

        // Filtro por estatus
        if (estatus) {
            query = query.eq('estatus_eclesiastico', estatus);
        }

        // Filtro por siglo
        if (siglo) {
            query = query.eq('siglo', siglo);
        }

        // Búsqueda por texto
        if (search) {
            query = query.or('nombre.ilike.%' + search + '%,descripcion_corta.ilike.%' + search + '%');
        }

        // Orden y paginación
        query = query.order(orderBy, { ascending: ascending }).range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('[MARIALUX] Error fetching advocaciones:', error.message);
            return { data: [], count: 0, error: error };
        }

        return {
            data: data || [],
            count: count || 0,
            error: null
        };
    } catch (err) {
        console.error('[MARIALUX] fetchAdvocaciones exception:', err.message);
        return { data: [], count: 0, error: err };
    }
}

/**
 * Obtener ficha completa de una advocación por su slug
 */
async function fetchAdvocacionBySlug(slug) {
    try {
        const sb = requireSupabase();

        const { data, error } = await sb
            .from('advocaciones')
            .select(`
                *,
                paises(nombre, slug, codigo_iso, continentes(nombre, slug)),
                iconografia_items(id, titulo, descripcion, orden),
                referencias_doctrinales(id, fuente, titulo, cita, orden)
            `)
            .eq('slug', slug)
            .eq('publicado', true)
            .order('orden', { referencedTable: 'iconografia_items', ascending: true })
            .order('orden', { referencedTable: 'referencias_doctrinales', ascending: true })
            .maybeSingle();

        if (error) {
            console.error('[MARIALUX] Error fetching advocación:', error.message);
            return { data: null, error: error };
        }

        return { data: data, error: null };
    } catch (err) {
        console.error('[MARIALUX] fetchAdvocacionBySlug exception:', err.message);
        return { data: null, error: err };
    }
}

/**
 * Obtener todos los continentes
 */
async function fetchContinentes() {
    try {
        const sb = requireSupabase();
        const { data, error } = await sb
            .from('continentes')
            .select('id, nombre, slug')
            .order('nombre');

        if (error) {
            console.error('[MARIALUX] Error fetching continentes:', error.message);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('[MARIALUX] fetchContinentes exception:', err.message);
        return [];
    }
}

/**
 * Obtener conteos por estatus eclesiástico
 */
async function fetchEstatusCounts() {
    try {
        const sb = requireSupabase();
        const { data, error } = await sb
            .from('advocaciones')
            .select('estatus_eclesiastico')
            .eq('publicado', true);

        if (error) {
            console.error('[MARIALUX] Error fetching estatus counts:', error.message);
            return {};
        }

        var counts = {};
        (data || []).forEach(function (row) {
            var key = row.estatus_eclesiastico;
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    } catch (err) {
        console.error('[MARIALUX] fetchEstatusCounts exception:', err.message);
        return {};
    }
}
