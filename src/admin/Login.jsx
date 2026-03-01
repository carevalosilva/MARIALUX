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

    useEffect(() => {
        document.title = 'Admin Login';
        fetchParametros().then(p => {
            setSiteName(p.nombre_sitio || 'MARIALUX');
            document.title = (p.nombre_sitio || 'MARIALUX') + ' Admin Login';
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
                            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl">✝</div>
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
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                placeholder="admin@ejemplo.com" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                placeholder="••••••••" />
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
