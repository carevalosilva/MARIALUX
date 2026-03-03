import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchParametros } from '../api';

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [siteName, setSiteName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        document.title = 'Admin Login';
        fetchParametros().then(p => {
            setSiteName(p.nombre_sitio || '');
            document.title = (p.nombre_sitio || '') + ' Admin Login';
        }).catch(() => { });
        // If already logged in, redirect
        if (sessionStorage.getItem('auth_token')) nav('/admin/dashboard');
    }, [nav]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            nav('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 text-primary mb-4">
                            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary w-6 h-6">
                                    <path d="M12 1 C7 1 4 6 4 11 C4 16 2 20 2 22 L22 22 C22 20 20 16 20 11 C20 6 17 1 12 1 Z" />
                                    <ellipse cx="12" cy="8.5" rx="3.5" ry="4.5" fill="white" />
                                    <path d="M12 15 L14.5 20 L9.5 20 Z" fill="white" />
                                </svg>
                            </div>
                            <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
                                {siteName} <span className="text-primary/70 font-medium">Admin</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm">Ingrese sus credenciales para administrar el portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                <span className="material-icons-outlined text-base">error</span>
                                {error}
                            </div>
                        )}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                placeholder="admin@ejemplo.com" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}>
                                    <span className="material-icons-outlined" style={{ fontSize: 20 }}>
                                        {showPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>
            </div>
            <footer className="py-6 text-center">
                <p className="text-slate-400 text-xs tracking-wide">© {new Date().getFullYear()} {siteName} Admin</p>
            </footer>
        </div>
    );
}
