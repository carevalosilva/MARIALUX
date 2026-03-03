import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchAdvocacion } from '../api';
import { useSiteParams } from '../context/SiteParamsContext';

export default function Detalle() {
    const [searchParams] = useSearchParams();
    const slug = searchParams.get('slug');
    const siteParams = useSiteParams();
    const [adv, setAdv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!slug) { setLoading(false); setError('No se especificó una advocación'); return; }
        fetchAdvocacion(slug)
            .then(data => { setAdv(data); document.title = data.nombre + ' | ' + (siteParams.nombre_sitio || ''); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [slug, siteParams]);

    if (loading) return (<><Navbar /><div className="pt-32 text-center text-slate-400">Cargando...</div></>);
    if (error || !adv) return (<><Navbar /><div className="pt-32 text-center"><p className="text-red-500">Error: {error || 'Advocación no encontrada'}</p><Link to="/explorador" className="text-primary mt-4 inline-block">← Volver al explorador</Link></div></>);

    const escapeP = (text) => text ? text.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>) : null;

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setDownloading(true);
        try {
            const element = contentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
                windowWidth: element.scrollWidth,
                ignoreElements: (el) => el.id === 'btn-download-pdf',
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margin each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10; // top margin

            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);

            while (heightLeft > 0) {
                position = position - (pdfHeight - 20);
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }

            const fileName = (adv.nombre || 'ficha').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_');
            pdf.save(`${fileName}.pdf`);
        } catch (err) {
            console.error('Error generando PDF:', err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen">
                {/* Breadcrumb */}
                <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-slate-500">
                    <Link to="/" className="hover:text-primary">Inicio</Link> ›{' '}
                    <Link to="/explorador" className="hover:text-primary">Explorador</Link> ›{' '}
                    {adv.paises?.continentes?.nombre && <><Link to={`/explorador?continente=${adv.paises.continentes.slug}`} className="hover:text-primary">{adv.paises.continentes.nombre}</Link> › </>}
                    <span className="text-slate-700 dark:text-white font-medium">{adv.nombre}</span>
                </div>

                <div className="max-w-6xl mx-auto px-6 pb-20" ref={contentRef}>
                    {/* Header */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">
                        <div className="lg:col-span-2">
                            {adv.imagen_url && (
                                <div className="rounded-2xl overflow-hidden shadow-xl">
                                    <img src={adv.imagen_url} alt={adv.nombre} className="w-full object-cover" />
                                </div>
                            )}
                            {adv.imagen_caption && <p className="text-xs text-slate-400 mt-3 text-center italic">{adv.imagen_caption}</p>}
                        </div>
                        <div className="lg:col-span-3">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">
                                {adv.estatus_eclesiastico}
                            </span>
                            <h1 className="serif-font text-4xl md:text-5xl text-slate-900 dark:text-white mb-6">{adv.nombre}</h1>
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">País</p>
                                    <p className="font-semibold text-slate-700 dark:text-white">{adv.paises?.nombre || '—'}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Siglo</p>
                                    <p className="font-semibold text-slate-700 dark:text-white">{adv.anio ? `${adv.siglo} (${adv.anio})` : (adv.siglo || '—')}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Festividad</p>
                                    <p className="font-semibold text-slate-700 dark:text-white">{adv.festividad || '—'}</p>
                                </div>
                            </div>
                            {adv.descripcion_corta && <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{adv.descripcion_corta}</p>}
                        </div>
                    </div>

                    {/* Historia */}
                    {adv.historia && (
                        <section className="mb-16" id="historia">
                            <h2 className="serif-font text-2xl text-slate-900 dark:text-white mb-2">Historia</h2>
                            <div className="w-10 h-0.5 bg-primary mb-6" />
                            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">{escapeP(adv.historia)}</div>
                        </section>
                    )}

                    {/* Significado */}
                    {adv.significado_espiritual && (
                        <section className="mb-16" id="significado">
                            <h2 className="serif-font text-2xl text-slate-900 dark:text-white mb-2">Significado Espiritual</h2>
                            <div className="w-10 h-0.5 bg-primary mb-6" />
                            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">{escapeP(adv.significado_espiritual)}</div>
                            {adv.cita_destacada && (
                                <blockquote className="border-l-4 border-primary pl-6 mt-6 serif-font text-lg italic text-slate-500 dark:text-slate-400">
                                    "{adv.cita_destacada}"
                                </blockquote>
                            )}
                        </section>
                    )}

                    {/* Iconografia */}
                    {adv.iconografia_items?.length > 0 && (
                        <section className="mb-16" id="iconografia">
                            <h2 className="serif-font text-2xl text-slate-900 dark:text-white mb-2">Iconografía y Simbolismo</h2>
                            <div className="w-10 h-0.5 bg-primary mb-6" />
                            <ul className="space-y-4">
                                {adv.iconografia_items.map(item => (
                                    <li key={item.id} className="flex gap-3">
                                        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <div>
                                            <strong className="text-slate-900 dark:text-white">{item.titulo}:</strong>{' '}
                                            <span className="text-slate-600 dark:text-slate-400">{item.descripcion}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Notas doctrinales */}
                    {(adv.notas_doctrinales || adv.referencias_doctrinales?.length > 0) && (
                        <section className="mb-16" id="doctrina">
                            <h2 className="serif-font text-2xl text-slate-900 dark:text-white mb-2">Notas Doctrinales</h2>
                            <div className="w-10 h-0.5 bg-primary mb-6" />
                            {adv.notas_doctrinales && <div className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{escapeP(adv.notas_doctrinales)}</div>}
                            {adv.referencias_doctrinales?.map(ref => (
                                <div key={ref.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border border-slate-100 dark:border-slate-700 mb-3">
                                    <p className="font-semibold text-slate-900 dark:text-white mb-1">{ref.titulo || ref.fuente}:</p>
                                    <p className="italic">"{ref.cita}" ({ref.fuente})</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Fuentes */}
                    {adv.fuentes && (
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                            Fuentes: {adv.fuentes}
                        </div>
                    )}

                    {/* Botón Descargar PDF */}
                    <div id="btn-download-pdf" className="mt-12 flex justify-center">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {downloading ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                                </svg>
                            )}
                            {downloading ? 'Generando PDF...' : 'Descargar Ficha en PDF'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
