import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSiteParams } from '../context/SiteParamsContext';
import { submitContacto } from '../api';

export default function Contacto() {
    const params = useSiteParams();
    const siteName = params.nombre_sitio || '';

    const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null); // { type: 'success'|'error', message }

    useEffect(() => {
        document.title = 'Contacto | ' + siteName;
        window.scrollTo(0, 0);
    }, [siteName]);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setResult(null);

        if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
            setResult({ type: 'error', message: 'Por favor complete los campos obligatorios.' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setResult({ type: 'error', message: 'Por favor ingrese un email válido.' });
            return;
        }

        setSending(true);
        try {
            await submitContacto(form);
            setResult({ type: 'success', message: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.' });
            setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
        } catch (err) {
            setResult({ type: 'error', message: err.message || 'Error al enviar el mensaje.' });
        } finally {
            setSending(false);
        }
    }

    const inputBase = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm';

    return (
        <>
            <Navbar />

            {/* Hero */}
            <header className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/20 via-transparent to-primary/10" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase rounded-full mb-8">
                        <span className="material-icons-outlined text-sm">mail</span>
                        Dudas y Consultas
                    </span>
                    <h1 className="serif-font text-5xl md:text-6xl text-slate-900 dark:text-white leading-tight mb-6">
                        Contacto
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-light max-w-xl mx-auto">
                        ¿Tiene alguna duda o consulta? Completa el formulario y nos pondremos en contacto contigo.
                    </p>
                    <div className="w-16 h-0.5 bg-primary mx-auto mt-8" />
                </div>
            </header>

            {/* Form Section */}
            <section className="pb-32 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-100/50 dark:shadow-none p-8 md:p-12">

                        {/* Success / Error Banner */}
                        {result && (
                            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl mb-8 text-sm font-medium ${result.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}>
                                <span className="material-icons-outlined text-lg">
                                    {result.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {result.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Nombre <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Su nombre completo"
                                    className={inputBase}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    className={inputBase}
                                    required
                                />
                            </div>

                            {/* Asunto */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Asunto <span className="text-slate-300 dark:text-slate-600 text-[10px] normal-case">(opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    name="asunto"
                                    value={form.asunto}
                                    onChange={handleChange}
                                    placeholder="Tema de su consulta"
                                    className={inputBase}
                                />
                            </div>

                            {/* Mensaje */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                    Mensaje <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    name="mensaje"
                                    value={form.mensaje}
                                    onChange={handleChange}
                                    placeholder="Escriba su duda o consulta aquí..."
                                    rows={5}
                                    className={inputBase + ' resize-none'}
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm"
                            >
                                {sending ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-outlined text-base">send</span>
                                        Enviar Mensaje
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
