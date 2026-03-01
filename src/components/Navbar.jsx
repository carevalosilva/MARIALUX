import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteParams } from '../context/SiteParamsContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const params = useSiteParams();
    const loc = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const current = loc.pathname;

    const [searchTerm, setSearchTerm] = useState('');

    const p1 = params.nombre_sitio_parte1 || '';
    const p2 = params.nombre_sitio_parte2 || '';

    const linkClass = (path) =>
        `transition-colors pb-1 border-b-2 ${current === path ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate('/explorador?search=' + encodeURIComponent(searchTerm.trim()));
            setSearchTerm('');
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary w-9 h-9">
                        <path d="M12 1 C7 1 4 6 4 11 C4 16 2 20 2 22 L22 22 C22 20 20 16 20 11 C20 6 17 1 12 1 Z" />
                        <ellipse cx="12" cy="8.5" rx="3.5" ry="4.5" className="fill-white dark:fill-background-dark" />
                        <path d="M12 15 L14.5 20 L9.5 20 Z" className="fill-white dark:fill-background-dark" />
                    </svg>
                    <span className="serif-font text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-widest">
                        {p1}<span className="text-primary">{p2}</span>
                    </span>
                </Link>
                <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide uppercase">
                    <Link className={linkClass('/')} to="/">Inicio</Link>
                    <Link className={linkClass('/explorador')} to="/explorador">Explorador</Link>
                </div>
                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative group">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-full text-sm w-48 transition-all focus:w-64"
                            placeholder="Buscar advocación..." type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <button
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary transition-all duration-300 active:scale-90"
                    >
                        <span className="material-icons-outlined text-xl transition-transform duration-500" style={{ transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}>
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
