import { Link } from 'react-router-dom';
import { useSiteParams } from '../context/SiteParamsContext';

export default function Footer() {
    const params = useSiteParams();
    const p1 = params.nombre_sitio_parte1 || 'MARIA';
    const p2 = params.nombre_sitio_parte2 || 'LUX';
    const desc = params.descripcion_sitio || 'Un espacio educativo dedicado a la difusión y el estudio de las diversas expresiones de devoción a la Madre de Dios en todo el mundo.';
    const copy = params.copyright_texto || '© 2024 Advocaciones Marianas. El contenido de este portal tiene carácter educativo y divulgativo.';

    return (
        <footer className="bg-white dark:bg-background-dark border-t border-primary/5 py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary w-7 h-7">
                                <path d="M12 1 C7 1 4 6 4 11 C4 16 2 20 2 22 L22 22 C22 20 20 16 20 11 C20 6 17 1 12 1 Z" />
                                <ellipse cx="12" cy="8.5" rx="3.5" ry="4.5" className="fill-white dark:fill-background-dark" />
                                <path d="M12 15 L14.5 20 L9.5 20 Z" className="fill-white dark:fill-background-dark" />
                            </svg>
                            <span className="serif-font text-lg font-bold tracking-tight uppercase">
                                {p1}<span className="text-primary">{p2}</span>
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">{desc}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Explorar</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <li><Link className="hover:text-primary transition-colors" to="/explorador">Explorador</Link></li>
                            <li><Link className="hover:text-primary transition-colors" to="/">Inicio</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Proyecto</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <li><Link className="hover:text-primary transition-colors" to="/sobre-nosotros">Sobre Nosotros</Link></li>
                            <li><Link className="hover:text-primary transition-colors" to="/contacto">Contacto</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-400">{copy}</p>
                    <div className="flex items-center gap-4">
                        <a className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp">
                            <span className="material-icons-outlined text-base">share</span>
                        </a>
                        <Link className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" to="/contacto" aria-label="Contacto">
                            <span className="material-icons-outlined text-base">email</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
