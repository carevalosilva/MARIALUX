import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSiteParams } from '../context/SiteParamsContext';

import mapImg from '/assets/images/1883_religions_map.jpg';
import mosaicImg from '/assets/images/ravenna_mosaic.jpg';
import vladImg from '/assets/images/Vladimirskaya.jpg';

export default function Home() {
    const params = useSiteParams();

    useEffect(() => {
        document.title = 'Inicio | ' + (params.nombre_sitio || '');
    }, [params]);

    const cards = [
        { href: '/explorador', img: mapImg, icon: 'explore', title: 'Por Región', desc: 'Descubra las advocaciones por continentes y santuarios nacionales.' },
        { href: '/explorador', img: mosaicImg, icon: 'hourglass_empty', title: 'Por Siglo', desc: 'Un recorrido cronológico desde los primeros siglos hasta la actualidad.' },
        { href: '/explorador', img: vladImg, icon: 'auto_awesome', title: 'Por Tipo', desc: 'Apariciones, patronazgos, dogmas e iconografías marianas.' },
    ];

    return (
        <>
            <Navbar />
            <header className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />
                </div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase rounded-full mb-8">
                        Santa María, Madre de Dios
                    </span>
                    <h1 className="serif-font text-5xl md:text-7xl text-slate-900 dark:text-white leading-tight mb-8 italic">
                        {(params.hero_titulo || '').split('\n').map((line, i, arr) => (
                            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                        ))}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-10 max-w-2xl mx-auto">
                        {params.hero_subtitulo || ''}
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <a className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2" href="#explorar">
                            Iniciar Exploración
                            <span className="material-icons-outlined text-sm">arrow_downward</span>
                        </a>
                        <p className="text-xs text-slate-400 italic mt-6 flex items-center gap-2">
                            <span className="material-icons-outlined text-sm">info</span>
                            Todas las advocaciones corresponden a la única Virgen María.
                        </p>
                    </div>
                </div>
            </header>

            <section className="py-24 bg-white dark:bg-background-dark/50" id="explorar">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="serif-font text-3xl text-slate-900 dark:text-white mb-4">Criterios de Exploración</h2>
                        <div className="w-12 h-0.5 bg-primary mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {cards.map(c => (
                            <Link key={c.title} to={c.href}
                                className="group relative bg-background-light dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1">
                                <div className="aspect-[4/5] relative">
                                    <img className="absolute inset-0 w-full h-full object-cover sepia-filter opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" src={c.img} alt={c.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent dark:from-background-dark" />
                                </div>
                                <div className="absolute bottom-0 left-0 p-8 w-full text-center">
                                    <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-md text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <span className="material-symbols-outlined font-light">{c.icon}</span>
                                    </div>
                                    <h3 className="serif-font text-2xl mb-2 text-slate-900 dark:text-white">{c.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-light px-4">{c.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="material-icons-outlined text-primary/40 text-4xl mb-6">format_quote</span>
                    <blockquote className="serif-font text-3xl italic text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                        "La Virgen María, que en el momento de la Anunciación respondió con su 'Fiat', es el modelo perfecto de la fe cristiana."
                    </blockquote>
                    <cite className="text-xs uppercase tracking-widest text-primary font-semibold not-italic">— Reflexión Eclesial</cite>
                </div>
            </section>

            <Footer />
        </>
    );
}
