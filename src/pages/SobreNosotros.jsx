import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSiteParams } from '../context/SiteParamsContext';

export default function SobreNosotros() {
    const params = useSiteParams();
    const contenido = params.quienes_somos_contenido || '';
    const siteName = params.nombre_sitio || '';

    useEffect(() => {
        document.title = 'Sobre Nosotros | ' + siteName;
        window.scrollTo(0, 0);
    }, [siteName]);

    return (
        <>
            <Navbar />

            {/* Hero */}
            <header className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase rounded-full mb-8">
                        <span className="material-icons-outlined text-sm">group</span>
                        Nuestro Proyecto
                    </span>
                    <h1 className="serif-font text-5xl md:text-6xl text-slate-900 dark:text-white leading-tight mb-6">
                        Sobre Nosotros
                    </h1>
                    <div className="w-16 h-0.5 bg-primary mx-auto" />
                </div>
            </header>

            {/* Content */}
            <section className="pb-32 px-6">
                <div className="max-w-3xl mx-auto">
                    {contenido ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-100/50 dark:shadow-none p-10 md:p-14">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary w-6 h-6">
                                        <path d="M12 1 C7 1 4 6 4 11 C4 16 2 20 2 22 L22 22 C22 20 20 16 20 11 C20 6 17 1 12 1 Z" />
                                        <ellipse cx="12" cy="8.5" rx="3.5" ry="4.5" className="fill-white dark:fill-slate-900" />
                                        <path d="M12 15 L14.5 20 L9.5 20 Z" className="fill-white dark:fill-slate-900" />
                                    </svg>
                                </div>
                                <h2 className="serif-font text-2xl text-slate-900 dark:text-white">¿Quiénes Somos?</h2>
                            </div>
                            {contenido.split('\n').filter(Boolean).map((paragraph, i) => (
                                <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 last:mb-0">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    ) : (
                        /* Skeleton loader */
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-10 md:p-14 animate-pulse">
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-8" />
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Quote */}
            <section className="py-20 px-6 bg-white dark:bg-background-dark/50">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="material-icons-outlined text-primary/40 text-4xl mb-6">format_quote</span>
                    <blockquote className="serif-font text-2xl italic text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                        "María, con su fe, abre la puerta de la historia a Dios."
                    </blockquote>
                    <cite className="text-xs uppercase tracking-widest text-primary font-semibold not-italic">— Reflexión Mariana</cite>
                </div>
            </section>

            <Footer />
        </>
    );
}
