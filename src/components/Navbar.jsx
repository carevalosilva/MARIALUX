import { Link, useLocation } from 'react-router-dom';
import { useSiteParams } from '../context/SiteParamsContext';

export default function Navbar() {
    const params = useSiteParams();
    const loc = useLocation();
    const current = loc.pathname;

    const p1 = params.nombre_sitio_parte1 || 'MARIA';
    const p2 = params.nombre_sitio_parte2 || 'LUX';

    const linkClass = (path) =>
        `transition-colors pb-1 border-b-2 ${current === path ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`;

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="material-icons-outlined text-primary text-3xl">church</span>
                    <span className="serif-font text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-widest">
                        {p1}<span className="text-primary">{p2}</span>
                    </span>
                </Link>
                <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide uppercase">
                    <Link className={linkClass('/')} to="/">Inicio</Link>
                    <Link className={linkClass('/explorador')} to="/explorador">Explorador</Link>
                </div>
                <div className="flex items-center">
                    <div className="relative group">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-full text-sm w-48 transition-all focus:w-64"
                            placeholder="Buscar advocación..." type="text"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}
