import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchAdvocaciones, fetchContinentes, fetchEstatusCounts } from '../api';
import { useSiteParams } from '../context/SiteParamsContext';

export default function Explorador() {
    const params = useSiteParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [advocaciones, setAdvocaciones] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [continentes, setContinentes] = useState([]);
    const [estatusCounts, setEstatusCounts] = useState({});

    const [filters, setFilters] = useState({
        page: 1,
        pageSize: 12,
        continente: searchParams.get('continente') || '',
        siglo: searchParams.get('siglo') || '',
        tipoOrigen: searchParams.get('tipo') || '',
        estatus: '',
        search: '',
        orderBy: 'anio',
        ascending: 'true',
    });

    useEffect(() => {
        document.title = 'Explorador | ' + (params.nombre_sitio || 'MARIALUX');
    }, [params]);

    useEffect(() => {
        fetchContinentes().then(setContinentes).catch(() => { });
        fetchEstatusCounts().then(setEstatusCounts).catch(() => { });
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchAdvocaciones(filters);
            setAdvocaciones(result.data);
            setTotal(result.count);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, [filters]);

    useEffect(() => { load(); }, [load]);

    const updateFilter = (key, val) => {
        setFilters(f => ({ ...f, [key]: val, page: 1 }));
    };

    const totalPages = Math.ceil(total / filters.pageSize);

    const siglos = ['Siglo I-V', 'Siglo VI-X', 'Siglo XI-XV', 'Siglo XVI', 'Siglo XVII', 'Siglo XVIII', 'Siglo XIX', 'Siglo XX', 'Siglo XXI'];
    const tipos = ['Aparición', 'Patronazgo', 'Dogma', 'Devoción popular', 'Imagen encontrada', 'Visión mística'];

    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center mb-12">
                        <h1 className="serif-font text-4xl text-slate-900 dark:text-white mb-4">Explorador de Advocaciones</h1>
                        <p className="text-slate-500 dark:text-slate-400">Descubra las manifestaciones de la Virgen María</p>
                    </div>

                    {/* Search */}
                    <div className="max-w-xl mx-auto mb-10">
                        <div className="relative">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-full bg-white dark:bg-slate-900 text-sm focus:border-primary focus:ring-0 transition-all"
                                placeholder="Buscar por nombre o descripción..."
                                value={filters.search}
                                onChange={e => updateFilter('search', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-8 space-y-4">
                        {/* Continentes */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button onClick={() => updateFilter('continente', '')}
                                className={`px-4 py-2 rounded-full text-sm border transition-all ${!filters.continente ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 hover:border-primary'}`}>
                                Todos
                            </button>
                            {continentes.map(c => (
                                <button key={c.slug} onClick={() => updateFilter('continente', c.slug)}
                                    className={`px-4 py-2 rounded-full text-sm border transition-all ${filters.continente === c.slug ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 hover:border-primary'}`}>
                                    {c.nombre}
                                </button>
                            ))}
                        </div>
                        {/* Siglos */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {siglos.map(s => (
                                <button key={s} onClick={() => updateFilter('siglo', filters.siglo === s ? '' : s)}
                                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${filters.siglo === s ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 hover:border-primary'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        {/* Tipo */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            <select value={filters.tipoOrigen} onChange={e => updateFilter('tipoOrigen', e.target.value)}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:border-primary focus:ring-0">
                                <option value="">Todos los tipos</option>
                                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Results */}
                    <p className="text-sm text-slate-500 mb-6 text-center">{total} advocaciones encontradas</p>

                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Cargando...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {advocaciones.map(adv => (
                                <Link key={adv.id} to={`/detalle?slug=${adv.slug}`}
                                    className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1">
                                    <div className="aspect-[4/5] relative bg-slate-100 dark:bg-slate-800">
                                        {adv.imagen_url && (
                                            <img src={adv.imagen_url} alt={adv.nombre}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-white/90 dark:bg-slate-800/90 text-xs px-2 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                                {adv.siglo || '—'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{adv.nombre}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{adv.descripcion_corta}</p>
                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                                            {adv.paises?.nombre && <span className="text-xs bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{adv.paises.nombre}</span>}
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{adv.estatus_eclesiastico}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm disabled:opacity-40">← Anterior</button>
                            <span className="px-4 py-2 text-sm text-slate-500">{filters.page} / {totalPages}</span>
                            <button disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm disabled:opacity-40">Siguiente →</button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
