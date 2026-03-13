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
                        <a className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-primary hover:text-white transition-all" href="https://www.instagram.com/consuelodelosafligidos.ig" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
