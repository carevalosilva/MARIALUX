-- Importación masiva de Advocaciones Marianas
-- Ejecutar en SQL Editor de Supabase
-- Maneja inserción de continentes, países y advocaciones evitando duplicados.

DO $$
DECLARE
    -- IDs de Continentes
    v_america_id UUID;
    v_europa_id UUID;
    
    -- IDs de Países
    v_argentina_id UUID;
    v_chile_id UUID;
    v_colombia_id UUID;
    v_espana_id UUID;
    v_italia_id UUID;
    v_mexico_id UUID;
    v_peru_id UUID;
    v_portugal_id UUID;
    v_venezuela_id UUID;
    
BEGIN
    ---------------------------------------------------------------------------
    -- 1. CONTINENTES
    ---------------------------------------------------------------------------
    
    -- América
    INSERT INTO public.continentes (nombre, slug)
    VALUES ('América', 'america')
    ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_america_id;
    
    IF v_america_id IS NULL THEN
        SELECT id INTO v_america_id FROM public.continentes WHERE slug = 'america';
    END IF;

    -- Europa
    INSERT INTO public.continentes (nombre, slug)
    VALUES ('Europa', 'europa')
    ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_europa_id;
    
    IF v_europa_id IS NULL THEN
        SELECT id INTO v_europa_id FROM public.continentes WHERE slug = 'europa';
    END IF;

    ---------------------------------------------------------------------------
    -- 2. PAÍSES
    ---------------------------------------------------------------------------

    -- Argentina
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Argentina', 'argentina', 'AR', v_america_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id
    RETURNING id INTO v_argentina_id;
    
    IF v_argentina_id IS NULL THEN
        SELECT id INTO v_argentina_id FROM public.paises WHERE slug = 'argentina';
    END IF;

    -- Chile
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Chile', 'chile', 'CL', v_america_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id
    RETURNING id INTO v_chile_id;
    
    IF v_chile_id IS NULL THEN
        SELECT id INTO v_chile_id FROM public.paises WHERE slug = 'chile';
    END IF;

    -- Colombia
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Colombia', 'colombia', 'CO', v_america_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id
    RETURNING id INTO v_colombia_id;
    
    IF v_colombia_id IS NULL THEN
        SELECT id INTO v_colombia_id FROM public.paises WHERE slug = 'colombia';
    END IF;

    -- España
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('España', 'espana', 'ES', v_europa_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id
    RETURNING id INTO v_espana_id;
    
    IF v_espana_id IS NULL THEN
        SELECT id INTO v_espana_id FROM public.paises WHERE slug = 'espana';
    END IF;

    -- Italia
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Italia', 'italia', 'IT', v_europa_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id
    RETURNING id INTO v_italia_id;
    
    IF v_italia_id IS NULL THEN
        SELECT id INTO v_italia_id FROM public.paises WHERE slug = 'italia';
    END IF;

    -- México
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('México', 'mexico', 'MX', v_america_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id
    RETURNING id INTO v_mexico_id;
    
    IF v_mexico_id IS NULL THEN
        SELECT id INTO v_mexico_id FROM public.paises WHERE slug = 'mexico';
    END IF;

    -- Perú
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Perú', 'peru', 'PE', v_america_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id
    RETURNING id INTO v_peru_id;
    
    IF v_peru_id IS NULL THEN
        SELECT id INTO v_peru_id FROM public.paises WHERE slug = 'peru';
    END IF;

    -- Portugal
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Portugal', 'portugal', 'PT', v_europa_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_europa_id
    RETURNING id INTO v_portugal_id;
    
    IF v_portugal_id IS NULL THEN
        SELECT id INTO v_portugal_id FROM public.paises WHERE slug = 'portugal';
    END IF;

    -- Venezuela
    INSERT INTO public.paises (nombre, slug, codigo_iso, continente_id)
    VALUES ('Venezuela', 'venezuela', 'VE', v_america_id)
    ON CONFLICT (slug) DO UPDATE SET continente_id = v_america_id
    RETURNING id INTO v_venezuela_id;
    
    IF v_venezuela_id IS NULL THEN
        SELECT id INTO v_venezuela_id FROM public.paises WHERE slug = 'venezuela';
    END IF;

    ---------------------------------------------------------------------------
    -- 3. ADVOCACIONES
    ---------------------------------------------------------------------------

    -- ARGENTINA: Nuestra Señora de Luján
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'nuestra-senora-de-lujan',
        'Nuestra Señora de Luján',
        'Patrona de Argentina, Uruguay y Paraguay. Su imagen decidió milagrosamente quedarse en las orillas del río Luján en 1630.',
        v_argentina_id,
        'Luján, Buenos Aires',
        'Siglo XVII',
        1630,
        '8 de Mayo',
        'Imagen Hallada',
        'Culto Universal',
        true,
        'En 1630, un hacendado portugués encargó una imagen de la Inmaculada Concepción. La carreta que la transportaba se detuvo inexplicable cerca del río Luján y no pudo moverse hasta que bajaron el cajón con la imagen. Esto fue interpretado como la voluntad de la Virgen de quedarse allí.',
        'Símbolo de la protección maternal sobre la nación argentina y la cercanía de María con los humildes.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- CHILE: Nuestra Señora del Carmen de Maipú
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'virgen-del-carmen-maipu',
        'Nuestra Señora del Carmen de Maipú',
        'Reina y Patrona de Chile, Generala de las Fuerzas Armadas. Históricamente ligada a la independencia del país.',
        v_chile_id,
        'Maipú, Santiago',
        'Siglo XIX',
        1817,
        '16 de Julio',
        'Patronazgo Histórico',
        'Culto Universal',
        true,
        'El General Bernardo O''Higgins prometió levantar un santuario en su honor donde se consolidara la independencia de Chile. Tras la victoria en Maipú (1818), se construyó el Templo Votivo.',
        'Representa la protección en momentos de dificultad y la identidad histórica y espiritual de la nación chilena.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- COLOMBIA: Nuestra Señora de Chiquinquirá
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'virgen-de-chiquinquira',
        'Nuestra Señora del Rosario de Chiquinquirá',
        'Patrona de Colombia. Imagen renovada milagrosamente en un lienzo deteriorado en 1586.',
        v_colombia_id,
        'Chiquinquirá, Boyacá',
        'Siglo XVI',
        1586,
        '9 de Julio',
        'Imagen Hallada',
        'Culto Universal',
        true,
        'Un lienzo viejo y borroso de la Virgen del Rosario recuperó sus colores y brillo original milagrosamente ante los ojos de una devota mujer, María Ramos, iniciando una gran devoción.',
        'Signo de renovación espiritual y restauración. María restaura la belleza original del alma humana.'
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- ESPAÑA: Virgen del Pilar
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'virgen-del-pilar',
        'Nuestra Señora del Pilar',
        'Patrona de la Hispanidad. Según la tradición, se apareció al Apóstol Santiago en carne mortal sobre una columna de jaspe.',
        v_espana_id,
        'Zaragoza',
        'Siglo I',
        40,
        '12 de Octubre',
        'Aparición',
        'Culto Universal',
        true,
        'Es considerada la primera aparición mariana de la historia. La Virgen vino a animar al Apóstol Santiago en su misión evangelizadora en España, dejando el Pilar como testimonio de su fortaleza.',
        'Simboliza la firmeza en la fe y la fortaleza apostólica. El Pilar es signo de la presencia constante de María en la Iglesia.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- ITALIA: Nuestra Señora de Loreto
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'nuestra-senora-de-loreto',
        'Nuestra Señora de Loreto',
        'Custodia de la Santa Casa de Nazaret, transportada milagrosamente a Italia. Patrona de los aviadores.',
        v_italia_id,
        'Loreto',
        'Siglo XIII',
        1294,
        '10 de Diciembre',
        'Imagen Hallada',
        'Culto Universal',
        true,
        'La tradición cuenta que la casa donde vivió la Sagrada Familia en Nazaret fue transportada por ángeles para protegerla de la invasión, llegando finalmente a Loreto.',
        'Nos recuerda el misterio de la Encarnación y la vida cotidiana de la Sagrada Familia como modelo de santidad doméstica.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- MÉXICO: Nuestra Señora de Guadalupe
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'nuestra-senora-de-guadalupe',
        'Nuestra Señora de Guadalupe',
        'Emperatriz de América. Se apareció al indio San Juan Diego en el cerro del Tepeyac en 1531, dejando su imagen impresa en la tilma.',
        v_mexico_id,
        'Ciudad de México',
        'Siglo XVI',
        1531,
        '12 de Diciembre',
        'Aparición',
        'Culto Universal',
        true,
        'En 1531, la Virgen se apareció pidiendo un templo. Como prueba para el obispo, hizo brotar rosas en invierno y dejó su imagen milagrosamente impresa en la tilma de Juan Diego.',
        'Icono de la evangelización inculturada y la dignidad de los pueblos indígenas. Muestra la ternura de Dios a través de María.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- PERÚ: Virgen de la Puerta (Otuzco) o Santa Rosa de Lima (Devoción Mariana) -> Optamos por una fuerte mariana: Virgen de Chapi o Evangelización
    -- Vamos con Virgen de la Evangelización (Patrona de Lima)
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'nuestra-senora-de-la-evangelizacion',
        'Nuestra Señora de la Evangelización',
        'Patrona de la Arquidiócesis de Lima. Imagen regalada por el Rey Carlos V a la ciudad de Lima en el siglo XVI.',
        v_peru_id,
        'Lima',
        'Siglo XVI',
        1551,
        '14 de Mayo',
        'Patronazgo Histórico',
        'Culto Universal',
        true,
        'Es una de las imágenes más antiguas de América. Ante ella rezó Santa Rosa de Lima y San Martín de Porres. Presidió el primer Concilio Limense.',
        'Representa el inicio de la fe en el Perú y la compañía maternal en la primera evangelización del continente.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- PORTUGAL: Nuestra Señora de Fátima
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'nuestra-senora-de-fatima',
        'Nuestra Señora del Rosario de Fátima',
        'Famosa aparición a tres pastorcitos en 1917, con un mensaje de oración, penitencia y conversión.',
        v_portugal_id,
        'Cova da Iria, Fátima',
        'Siglo XX',
        1917,
        '13 de Mayo',
        'Aparición',
        'Aprobación Pontificia',
        true,
        'Durante seis meses, la Virgen se apareció a Lucía, Francisco y Jacinta, culminando con el milagro del sol. Pidió el rezo del Rosario por la paz del mundo.',
        'Un llamado urgente a la conversión, la oración y la reparación por los pecados del mundo. Resalta el poder de la oración sencilla.'
    ) ON CONFLICT (slug) DO NOTHING;

    -- VENEZUELA: Nuestra Señora de Coromoto
    INSERT INTO public.advocaciones (
        slug, nombre, descripcion_corta, pais_id, lugar_especifico, siglo, anio, festividad, tipo_origen, estatus_eclesiastico, publicado,
        historia, significado_espiritual
    ) VALUES (
        'nuestra-senora-de-coromoto',
        'Nuestra Señora de Coromoto',
        'Patrona de Venezuela. Se apareció al cacique Coromoto de la tribu de los Cospes en 1652.',
        v_venezuela_id,
        'Guanare, Portuguesa',
        'Siglo XVII',
        1652,
        '11 de Septiembre',
        'Aparición',
        'Culto Universal',
        true,
        'La Virgen se apareció a la familia del cacique instándoles al bautismo. Dejó en manos del cacique una diminuta imagen (reliquia) que se venera hoy en día.',
        'Mensaje de reconciliación y encuentro entre culturas. María se hace presente en la historia de cada pueblo.'
    ) ON CONFLICT (slug) DO NOTHING;

END $$;
