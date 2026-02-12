-- Importación masiva de 150 Advocaciones Marianas - LISTADO COMPLETO Y CORREGIDO
-- Ejecutar en SQL Editor de Supabase
-- Maneja inserción de continentes, países y advocaciones.

DO $$
DECLARE
    -- IDs de Continentes
    v_africa_id UUID;
    v_america_id UUID;
    v_asia_id UUID;
    v_europa_id UUID;
    v_oceania_id UUID;
    
    -- IDs de Países (reutilizable)
    v_pais_id UUID;
    
BEGIN
    -- 1. CONTINENTES
    INSERT INTO public.continentes (nombre, slug) VALUES ('África', 'africa') ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id INTO v_africa_id;
    IF v_africa_id IS NULL THEN SELECT id INTO v_africa_id FROM public.continentes WHERE slug = 'africa'; END IF;
    INSERT INTO public.continentes (nombre, slug) VALUES ('América', 'america') ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id INTO v_america_id;
    IF v_america_id IS NULL THEN SELECT id INTO v_america_id FROM public.continentes WHERE slug = 'america'; END IF;
    INSERT INTO public.continentes (nombre, slug) VALUES ('Asia', 'asia') ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id INTO v_asia_id;
    IF v_asia_id IS NULL THEN SELECT id INTO v_asia_id FROM public.continentes WHERE slug = 'asia'; END IF;
    INSERT INTO public.continentes (nombre, slug) VALUES ('Europa', 'europa') ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id INTO v_europa_id;
    IF v_europa_id IS NULL THEN SELECT id INTO v_europa_id FROM public.continentes WHERE slug = 'europa'; END IF;
    INSERT INTO public.continentes (nombre, slug) VALUES ('Oceanía', 'oceania') ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id INTO v_oceania_id;
    IF v_oceania_id IS NULL THEN SELECT id INTO v_oceania_id FROM public.continentes WHERE slug = 'oceania'; END IF;

    -- 2. PAÍSES Y ADVOCACIONES (Orden Alfabético por País)

    -- ALEMANIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Alemania', 'alemania', 'DE', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'alemania'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-schoenstatt', 'Nuestra Señora de Schoenstatt', 'Madre Tres Veces Admirable.', v_pais_id, 'Vallendar', 'Siglo XX', 1914, '18 de Octubre', 'Patronazgo Histórico', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- ANDORRA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Andorra', 'andorra', 'AD', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'andorra'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-meritxell', 'Nuestra Señora de Meritxell', 'Patrona.', v_pais_id, 'Meritxell', 'Siglo XII', 1100, '8 de Septiembre', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- ARGENTINA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Argentina', 'argentina', 'AR', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'argentina'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-lujan', 'Nuestra Señora de Luján', 'Patrona de Argentina.', v_pais_id, 'Luján', 'Siglo XVII', 1630, '8 de Mayo', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-carmen-de-cuyo', 'Virgen del Carmen de Cuyo', 'Patrona del Ejército de los Andes.', v_pais_id, 'Mendoza', 'Siglo XIX', 1817, '8 de Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-itati', 'Virgen de Itatí', 'Reina del Paraná.', v_pais_id, 'Itatí', 'Siglo XVI', 1589, '9 de Julio', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-mar-cautiva', 'Virgen del Mar Cautiva', 'Imagen transportada por el mar.', v_pais_id, 'Mar del Argentino', 'Siglo XVIII', 1758, 'Semana Santa', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-del-rosario-de-san-nicolas', 'Nuestra Señora del Rosario de San Nicolás', 'Apariciones a Gladys Motta.', v_pais_id, 'San Nicolás', 'Siglo XX', 1983, '25 de Septiembre', 'Aparición', 'Culto Local', true), -- Fixed
    ('virgen-del-rosario-del-milagro', 'Virgen del Rosario del Milagro', 'Patrona de Córdoba.', v_pais_id, 'Córdoba', 'Siglo XVI', 1592, 'Octubre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-del-buen-aire', 'Nuestra Señora del Buen Aire', 'Dio nombre a Buenos Aires.', v_pais_id, 'Buenos Aires', 'Siglo XVI', 1536, '24 de Abril', 'Patronazgo Histórico', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- ARMENIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Armenia', 'armenia', 'AM', v_asia_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_asia_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'armenia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-narek', 'Nuestra Señora de Narek', 'Asociada a San Gregorio.', v_pais_id, 'Narek', 'Siglo X', 950, 'Octubre', 'Patronazgo Histórico', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- BÉLGICA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Bélgica', 'belgica', 'BE', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'belgica'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-banneux', 'Nuestra Señora de Banneux', 'Virgen de los Pobres.', v_pais_id, 'Banneux', 'Siglo XX', 1933, '15 de Enero', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-beauraing', 'Nuestra Señora de Beauraing', 'Corazón de Oro.', v_pais_id, 'Beauraing', 'Siglo XX', 1932, '29 de Noviembre', 'Aparición', 'Aprobación Pontificia', true) ON CONFLICT (slug) DO NOTHING;

    -- BIELORRUSIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Bielorrusia', 'bielorrusia', 'BY', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'bielorrusia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-budslau', 'Nuestra Señora de Budslau', 'Patrona de Bielorrusia.', v_pais_id, 'Budslau', 'Siglo XVI', 1588, '2 de Julio', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;
    
    -- BOLIVIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Bolivia', 'bolivia', 'BO', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'bolivia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-copacabana', 'Nuestra Señora de Copacabana', 'Patrona de Bolivia.', v_pais_id, 'Copacabana', 'Siglo XVI', 1583, '5 de Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-urkupina', 'Virgen de Urkupiña', 'Venerada en Quillacollo.', v_pais_id, 'Quillacollo', 'Siglo XVIII', 1700, '15 de Agosto', 'Aparición', 'Culto Universal', true),
    ('virgen-de-chaguaya', 'Virgen de Chaguaya', 'Venerada en Tarija.', v_pais_id, 'Tarija', 'Siglo XVIII', 1750, 'Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-socavon', 'Virgen del Socavón', 'Patrona de Oruro.', v_pais_id, 'Oruro', 'Siglo XVIII', 1789, 'Carnaval', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- BOSNIA Y HERZEGOVINA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Bosnia y Herzegovina', 'bosnia', 'BA', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'bosnia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-medjugorje', 'Nuestra Señora de Medjugorje', 'Reina de la Paz.', v_pais_id, 'Medjugorje', 'Siglo XX', 1981, '25 de Junio', 'Aparición', 'En estudio', true) ON CONFLICT (slug) DO NOTHING;

    -- BRASIL
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Brasil', 'brasil', 'BR', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'brasil'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-aparecida', 'Nuestra Señora de Aparecida', 'Patrona de Brasil.', v_pais_id, 'Aparecida', 'Siglo XVIII', 1717, '12 de Octubre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-anguera', 'Nuestra Señora de Anguera', 'Apariciones en Bahía.', v_pais_id, 'Anguera', 'Siglo XX', 1987, 'Mayo', 'Aparición', 'En estudio', true),
    ('nuestra-senora-de-la-presentacion-de-natal', 'Presentación de Natal', 'Patrona.', v_pais_id, 'Natal', 'Siglo XVIII', 1753, '21 de Noviembre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-la-concepcion-aparecida', 'Concepción Aparecida', 'Variante de Aparecida.', v_pais_id, 'Aparecida', 'Siglo XVIII', 1717, '12 de Octubre', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- CHILE
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Chile', 'chile', 'CL', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'chile'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-andacollo', 'Nuestra Señora de Andacollo', 'Reina del Cobre.', v_pais_id, 'Andacollo', 'Siglo XVI', 1560, '26 de Diciembre', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-carmen-de-la-tirana', 'Carmen de La Tirana', 'Reina del Tamarugal.', v_pais_id, 'La Tirana', 'Siglo XIX', 1850, '16 de Julio', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-las-cuarenta-horas', 'Virgen de las Cuarenta Horas', 'Patrona de Limache.', v_pais_id, 'Limache', 'Siglo XIX', 1831, 'Febrero', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-rosario-del-maqui', 'Rosario del Maqui', 'Venerada en Olmué.', v_pais_id, 'Olmué', 'Siglo XIX', 1800, 'Octubre', 'Imagen Hallada', 'Culto Universal', true),
    ('santa-maria-de-rapa-nui', 'Santa María de Rapa Nui', 'Advocación en Pascua.', v_pais_id, 'Isla de Pascua', 'Siglo XX', 1970, 'Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-la-candelaria-de-copiapo', 'Candelaria de Copiapó', 'Venerada en Atacama.', v_pais_id, 'Copiapó', 'Siglo XVIII', 1780, '2 de Febrero', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- COLOMBIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Colombia', 'colombia', 'CO', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'colombia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('virgen-de-chiquinquira', 'Nuestra Señora de Chiquinquirá', 'Patrona de Colombia.', v_pais_id, 'Chiquinquirá', 'Siglo XVI', 1586, '9 de Julio', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-belen-de-popayan', 'Belén de Popayán', 'Venerada en Popayán.', v_pais_id, 'Popayán', 'Siglo XVII', 1600, 'Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-las-lajas', 'Nuestra Señora de las Lajas', 'Imagen en piedra.', v_pais_id, 'Ipiales', 'Siglo XVIII', 1754, '16 de Septiembre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-las-misericordias', 'Misericordias', 'Santa Rosa de Osos.', v_pais_id, 'Santa Rosa de Osos', 'Siglo XX', 1900, 'Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-del-milagro', 'Virgen del Milagro', 'Patrona de Tunja.', v_pais_id, 'Tunja', 'Siglo XVI', 1550, 'Agosto', 'Aparición', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- COSTA RICA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Costa Rica', 'costa-rica', 'CR', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'costa-rica'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-los-angeles', 'Nuestra Señora de los Ángeles', 'La Negrita.', v_pais_id, 'Cartago', 'Siglo XVII', 1635, '2 de Agosto', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- CUBA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Cuba', 'cuba', 'CU', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'cuba'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-la-caridad-del-cobre', 'Caridad del Cobre', 'Patrona de Cuba.', v_pais_id, 'El Cobre', 'Siglo XVII', 1612, '8 de Septiembre', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- ECUADOR
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Ecuador', 'ecuador', 'EC', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'ecuador'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-la-presentacion-del-quinche', 'Nuestra Señora del Quinche', 'Venerada en los Andes.', v_pais_id, 'El Quinche', 'Siglo XVI', 1585, '21 de Noviembre', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-la-nube', 'Virgen de la Nube', 'Aparecida.', v_pais_id, 'Azogues', 'Siglo XVII', 1696, '1 de Enero', 'Aparición', 'Culto Universal', true),
    ('virgen-de-el-panecillo', 'Virgen de El Panecillo', 'Estatua alada.', v_pais_id, 'Quito', 'Siglo XVIII', 1734, 'Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-quito', 'Virgen de Quito', 'Advocación quiteña.', v_pais_id, 'Quito', 'Siglo XVIII', 1700, 'Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-del-buen-suceso', 'Buen Suceso', 'Concepcionista.', v_pais_id, 'Quito', 'Siglo XVII', 1594, '2 de Febrero', 'Aparición', 'Culto Local', true) ON CONFLICT (slug) DO NOTHING;

    -- EGIPTO
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Egipto', 'egipto', 'EG', v_africa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_africa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'egipto'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-assiut', 'Nuestra Señora de Assiut', 'Apariciones recientes.', v_pais_id, 'Assiut', 'Siglo XXI', 2000, 'Agosto', 'Aparición', 'Culto Local', true),
    ('nuestra-senora-de-zeitoun', 'Nuestra Señora de Zeitoun', 'Apariciones masivas.', v_pais_id, 'El Cairo', 'Siglo XX', 1968, '2 de Abril', 'Aparición', 'Culto Local', true) ON CONFLICT (slug) DO NOTHING;

    -- ESPAÑA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('España', 'espana', 'ES', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'espana'; END IF;
    -- Inserción masiva de España
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-atocha', 'Atocha', 'Patrona Realeza.', v_pais_id, 'Madrid', 'Siglo VII', 700, 'Octubre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-begona', 'Begoña', 'Patrona Bilbao.', v_pais_id, 'Bilbao', 'Siglo XVI', 1500, '11 de Octubre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-la-cabeza', 'Cabeza', 'Andújar.', v_pais_id, 'Andújar', 'Siglo XIII', 1227, 'Abril', 'Aparición', 'Culto Universal', true),
    ('nuestra-senora-de-la-consolacion', 'Consolación', 'Utrera.', v_pais_id, 'Utrera', 'Siglo XV', 1400, '4 de Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-la-esperanza', 'Esperanza Macarena', 'Sevilla.', v_pais_id, 'Sevilla', 'Siglo XVII', 1600, '18 de Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-la-pena-de-francia', 'Peña de Francia', 'Salamanca.', v_pais_id, 'Salamanca', 'Siglo XV', 1434, '8 de Septiembre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-las-angustias', 'Angustias', 'Granada.', v_pais_id, 'Granada', 'Siglo XVI', 1500, '15 de Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-los-reyes', 'Virgen de los Reyes', 'Sevilla.', v_pais_id, 'Sevilla', 'Siglo XIII', 1248, '15 de Agosto', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-los-desamparados', 'Desamparados', 'Valencia.', v_pais_id, 'Valencia', 'Siglo XV', 1409, 'Mayo', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-covadonga', 'Covadonga', 'Asturias.', v_pais_id, 'Asturias', 'Siglo VIII', 722, '8 de Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-del-rocio', 'Rocío', 'Huelva.', v_pais_id, 'Almonte', 'Siglo XIII', 1280, 'Pentecostés', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-montserrat', 'Montserrat', 'Cataluña.', v_pais_id, 'Montserrat', 'Siglo IX', 880, '27 de Abril', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-la-almudena', 'Almudena', 'Madrid.', v_pais_id, 'Madrid', 'Siglo VIII', 712, '9 de Noviembre', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-sagrario', 'Sagrario', 'Toledo.', v_pais_id, 'Toledo', 'Siglo XII', 1100, '15 de Agosto', 'Patronazgo Histórico', 'Culto Universal', true),
    ('santa-maria-de-la-victoria', 'Victoria', 'Málaga.', v_pais_id, 'Málaga', 'Siglo XV', 1487, '8 de Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('santa-maria-de-africa', 'África', 'Ceuta.', v_pais_id, 'Ceuta', 'Siglo XV', 1421, '5 de Agosto', 'Patronazgo Histórico', 'Culto Universal', true),
    ('santisima-virgen-de-la-capilla', 'Capilla', 'Jaén.', v_pais_id, 'Jaén', 'Siglo XIII', 1230, 'Junio', 'Aparición', 'Culto Universal', true),
    ('santisima-virgen-del-remedio', 'Remedio', 'Alicante.', v_pais_id, 'Alicante', 'Siglo XVII', 1600, 'Octubre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-belen', 'Belén', 'Almansa.', v_pais_id, 'Almansa', 'Siglo XIII', 1244, 'Mayo', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-estibaliz', 'Estíbaliz', 'Álava.', v_pais_id, 'Estíbaliz', 'Siglo XI', 1074, 'Mayo', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-lluc', 'Lluc', 'Mallorca.', v_pais_id, 'Lluc', 'Siglo XIII', 1250, '12 de Septiembre', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-valvanera', 'Valvanera', 'La Rioja.', v_pais_id, 'Valvanera', 'Siglo IX', 800, 'Septiembre', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-la-candelaria', 'Candelaria', 'Canarias.', v_pais_id, 'Tenerife', 'Siglo XIV', 1392, '2 de Febrero', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-de-la-encarnacion', 'Encarnación', 'Patrona.', v_pais_id, 'Varios', 'Siglo XV', 1400, '25 de Marzo', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-la-pobreza', 'Pobreza', 'Patrona.', v_pais_id, 'España', 'Siglo XX', 1900, 'Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-los-milagros', 'Milagros', 'Palos de la Frontera.', v_pais_id, 'Huelva', 'Siglo XII', 1100, '15 de Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-loreto-de-algezares', 'Loreto de Algezares', 'Murcia.', v_pais_id, 'Algezares', 'Siglo XVI', 1500, '10 de Diciembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-fatima-en-tuy', 'Fátima en Tuy', 'Tuy.', v_pais_id, 'Tuy', 'Siglo XX', 1929, '13 de Junio', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-del-mayor-dolor', 'Mayor Dolor', 'Semana Santa.', v_pais_id, 'Andalucía', 'Siglo XVIII', 1700, 'Viernes Santo', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-del-mar', 'Virgen del Mar', 'Almería.', v_pais_id, 'Almería', 'Siglo XVI', 1502, 'Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-del-pino-de-el-paso', 'Pino de El Paso', 'La Palma.', v_pais_id, 'La Palma', 'Siglo XVI', 1500, 'Septiembre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-la-virgen-de-gracia', 'Gracia', 'San Lorenzo de El Escorial.', v_pais_id, 'Madrid', 'Siglo XVI', 1570, 'Septiembre', 'Patronazgo Histórico', 'Culto Universal', true),
    ('santa-maria-de-leyre', 'Leyre', 'Navarra.', v_pais_id, 'Leyre', 'Siglo IX', 840, '15 de Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-del-buenviaje', 'Buenviaje', 'Cádiz.', v_pais_id, 'Cádiz', 'Siglo XVII', 1600, 'Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-garabandal', 'Garabandal', 'Cantabria.', v_pais_id, 'Garabandal', 'Siglo XX', 1961, '18 de Junio', 'Aparición', 'En estudio', true) ON CONFLICT (slug) DO NOTHING;

    -- ESTADOS UNIDOS
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Estados Unidos', 'estados-unidos', 'US', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'estados-unidos'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-america', 'Nuestra Señora de América', 'Devoción USA.', v_pais_id, 'Indiana', 'Siglo XX', 1956, 'Septiembre', 'Aparición', 'Culto Local', true),
    ('nuestra-senora-del-buen-socorro', 'Buen Socorro', 'Aparición.', v_pais_id, 'Wisconsin', 'Siglo XIX', 1859, 'Octubre', 'Aparición', 'Culto Local', true) ON CONFLICT (slug) DO NOTHING;

    -- FILIPINAS
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Filipinas', 'filipinas', 'PH', v_asia_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_asia_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'filipinas'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-la-paz-y-del-buen-viaje', 'Paz y Buen Viaje', 'Antipolo.', v_pais_id, 'Antipolo', 'Siglo XVII', 1626, 'Mayo', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- FRANCIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Francia', 'francia', 'FR', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'francia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-lourdes', 'Lourdes', 'Aparición.', v_pais_id, 'Lourdes', 'Siglo XIX', 1858, '11 de Febrero', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-la-medalla-milagrosa', 'Medalla Milagrosa', 'Rue du Bac.', v_pais_id, 'París', 'Siglo XIX', 1830, '27 de Noviembre', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-la-salette', 'La Salette', 'Alpes.', v_pais_id, 'La Salette', 'Siglo XIX', 1846, '19 de Septiembre', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-laus', 'Laus', 'Alpes.', v_pais_id, 'Laus', 'Siglo XVII', 1664, '1 de Mayo', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-pontmain', 'Pontmain', 'Esperanza.', v_pais_id, 'Pontmain', 'Siglo XIX', 1871, '17 de Enero', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-paris', 'Notre-Dame', 'Catedral.', v_pais_id, 'París', 'Siglo XII', 1163, '15 de Agosto', 'Patronazgo Histórico', 'Culto Universal', true),
    ('nuestra-senora-de-pellevoisin', 'Pellevoisin', 'Aparición.', v_pais_id, 'Pellevoisin', 'Siglo XIX', 1876, '19 de Febrero', 'Aparición', 'Culto Local', true),
    ('nuestra-senora-de-rocamadour', 'Rocamadour', 'Virgen Negra.', v_pais_id, 'Rocamadour', 'Siglo XII', 1100, '8 de Septiembre', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-negra-de-le-puy', 'Le Puy', 'Virgen Negra.', v_pais_id, 'Le Puy', 'Siglo V', 430, '25 de Marzo', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-las-gracias-de-cotignac', 'Cotignac', 'Provenza.', v_pais_id, 'Cotignac', 'Siglo XVI', 1519, 'Agosto', 'Aparición', 'Culto Local', true),
    ('nuestra-senora-del-puy', 'Virgen del Puy', 'Puy-en-Velay.', v_pais_id, 'Puy', 'Siglo V', 400, 'Marzo', 'Imagen Hallada', 'Culto Universal', true),
    ('virgen-del-buen-remedio', 'Buen Remedio', 'Trinitarios.', v_pais_id, 'Cerfroid', 'Siglo XII', 1198, '8 de Octubre', 'Patronazgo Histórico', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- HONDURAS
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Honduras', 'honduras', 'HN', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'honduras'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-suyapa', 'Suyapa', 'Patrona.', v_pais_id, 'Tegucigalpa', 'Siglo XVIII', 1747, '3 de Febrero', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- INDIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('India', 'india', 'IN', v_asia_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_asia_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'india'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-velankanni', 'Velankanni', 'Salud.', v_pais_id, 'Velankanni', 'Siglo XVI', 1560, '8 de Septiembre', 'Aparición', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- IRLANDA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Irlanda', 'irlanda', 'IE', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'irlanda'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-knock', 'Knock', 'Aparición.', v_pais_id, 'Knock', 'Siglo XIX', 1879, '21 de Agosto', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-de-dublin', 'Dublín', 'Whitefriar.', v_pais_id, 'Dublín', 'Siglo XVI', 1500, '8 de Septiembre', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- ISRAEL
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Israel', 'israel', 'IL', v_asia_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_asia_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'israel'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-del-monte-carmelo', 'Monte Carmelo', 'Carmelitas.', v_pais_id, 'Haifa', 'Siglo XII', 1150, '16 de Julio', 'Patronazgo Histórico', 'Culto Universal', true),
    ('virgen-de-nazaret', 'Nazaret', 'Anunciación.', v_pais_id, 'Nazaret', 'Siglo I', 0, '25 de Marzo', 'Patronazgo Histórico', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- ITALIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Italia', 'italia', 'IT', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'italia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-loreto', 'Loreto', 'Santa Casa.', v_pais_id, 'Loreto', 'Siglo XIII', 1294, '10 de Diciembre', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-civitavecchia', 'Civitavecchia', 'Lágrimas.', v_pais_id, 'Civitavecchia', 'Siglo XX', 1995, '2 de Febrero', 'Aparición', 'Culto Local', true),
    ('nuestra-senora-de-trapani', 'Trapani', 'Sicilia.', v_pais_id, 'Trapani', 'Siglo XIII', 1250, '16 de Agosto', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-la-revelacion', 'Revelación', 'Tre Fontane.', v_pais_id, 'Roma', 'Siglo XX', 1947, '12 de Abril', 'Aparición', 'Aprobación Pontificia', true),
    ('nuestra-senora-del-perpetuo-socorro', 'Perpetuo Socorro', 'Roma.', v_pais_id, 'Roma', 'Siglo XV', 1499, '27 de Junio', 'Imagen Hallada', 'Culto Universal', true),
    ('nuestra-senora-de-las-lagrimas', 'Lágrimas', 'Siracusa.', v_pais_id, 'Siracusa', 'Siglo XX', 1953, 'Agosto', 'Aparición', 'Culto Local', true),
     ('virgen-de-la-humildad', 'Humildad', 'Pistoia.', v_pais_id, 'Pistoia', 'Siglo XIV', 1300, 'Julio', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- JAPÓN
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Japón', 'japon', 'JP', v_asia_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_asia_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'japon'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-akita', 'Akita', 'Apariciones.', v_pais_id, 'Akita', 'Siglo XX', 1973, '13 de Octubre', 'Aparición', 'Culto Local', true) ON CONFLICT (slug) DO NOTHING;

    -- MÉXICO
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('México', 'mexico', 'MX', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'mexico'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-guadalupe', 'Guadalupe', 'Patrona.', v_pais_id, 'México', 'Siglo XVI', 1531, '12 de Diciembre', 'Aparición', 'Culto Universal', true),
    ('nuestra-senora-de-la-luz', 'Luz', 'León.', v_pais_id, 'León', 'Siglo XVIII', 1732, 'Mayo', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- PAÍSES BAJOS
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Países Bajos', 'paises-bajos', 'NL', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'paises-bajos'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-todas-las-naciones', 'Señora de Todos', 'Ámsterdam.', v_pais_id, 'Ámsterdam', 'Siglo XX', 1945, '31 de Mayo', 'Aparición', 'Culto Local', true) ON CONFLICT (slug) DO NOTHING;

    -- POLONIA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Polonia', 'polonia', 'PL', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'polonia'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-czestochowa', 'Czestochowa', 'Reina.', v_pais_id, 'Jasna Góra', 'Siglo XIV', 1382, '26 de Agosto', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- PORTUGAL
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Portugal', 'portugal', 'PT', v_europa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'portugal'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-fatima', 'Fátima', 'Mensaje.', v_pais_id, 'Fátima', 'Siglo XX', 1917, '13 de Mayo', 'Aparición', 'Aprobación Pontificia', true) ON CONFLICT (slug) DO NOTHING;

    -- REPÚBLICA DOMINICANA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('República Dominicana', 'republica-dominicana', 'DO', v_america_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'republica-dominicana'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-las-mercedes', 'Mercedes', 'Patrona.', v_pais_id, 'Santo Cerro', 'Siglo XV', 1495, '24 de Septiembre', 'Imagen Hallada', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

    -- RUANDA
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Ruanda', 'ruanda', 'RW', v_africa_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_africa_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'ruanda'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-kibeho', 'Kibeho', 'Madre del Verbo.', v_pais_id, 'Kibeho', 'Siglo XX', 1981, '28 de Noviembre', 'Aparición', 'Aprobación Pontificia', true) ON CONFLICT (slug) DO NOTHING;

    -- VIETNAM
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id) VALUES ('Vietnam', 'vietnam', 'VN', v_asia_id) ON CONFLICT (slug) DO UPDATE SET continente_id = v_asia_id RETURNING id INTO v_pais_id;
    IF v_pais_id IS NULL THEN SELECT id INTO v_pais_id FROM public.paises WHERE slug = 'vietnam'; END IF;
    INSERT INTO public.advocaciones (slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado) VALUES
    ('nuestra-senora-de-la-vang', 'La Vang', 'Aparición.', v_pais_id, 'La Vang', 'Siglo XVIII', 1798, '15 de Agosto', 'Aparición', 'Culto Universal', true) ON CONFLICT (slug) DO NOTHING;

END $$;
