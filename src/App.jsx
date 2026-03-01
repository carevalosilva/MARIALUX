import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explorador from './pages/Explorador';
import Detalle from './pages/Detalle';
import SobreNosotros from './pages/SobreNosotros';
import Contacto from './pages/Contacto';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import AdminCrud from './admin/CrudPage';
import { SiteParamsProvider } from './context/SiteParamsContext';

const CRUD_PAGES = [
    { path: 'advocaciones', table: 'advocaciones', title: 'Advocaciones', singular: 'Advocación' },
    { path: 'continentes', table: 'continentes', title: 'Continentes', singular: 'Continente' },
    { path: 'paises', table: 'paises', title: 'Países', singular: 'País' },
    { path: 'iconografia', table: 'iconografia_items', title: 'Iconografía', singular: 'Iconografía' },
    { path: 'referencias', table: 'referencias_doctrinales', title: 'Referencias Doctrinales', singular: 'Referencia' },
    { path: 'usuarios', table: 'usuarios', title: 'Usuarios', singular: 'Usuario' },
    { path: 'parametros', table: 'parametros_sitio', title: 'Parámetros del Sitio', singular: 'Parámetro' },
    { path: 'formularios', table: 'formularios_contacto', title: 'Formularios de Contacto', singular: 'Formulario' },
];

export default function App() {
    return (
        <SiteParamsProvider>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/explorador" element={<Explorador />} />
                <Route path="/detalle" element={<Detalle />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                <Route path="/contacto" element={<Contacto />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                {CRUD_PAGES.map(p => (
                    <Route key={p.path} path={`/admin/${p.path}`} element={<AdminCrud config={p} />} />
                ))}
            </Routes>
        </SiteParamsProvider>
    );
}
