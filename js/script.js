// ============================================================
// MARIALUX — Main Application Script
// ============================================================

function marialuxInit() {
    console.log('[MARIALUX] App initialized, readyState:', document.readyState);

    // --- Navigation Active State ---
    var rawPath = window.location.pathname.split('/').pop() || 'index.html';
    // Normalize: remove .html extension for consistent matching
    var currentPath = rawPath.replace('.html', '');
    if (currentPath === '') currentPath = 'index';
    console.log('[MARIALUX] Current path:', currentPath, '(raw:', rawPath, ')');

    document.querySelectorAll('nav a').forEach(function (link) {
        var href = (link.getAttribute('href') || '').replace('.html', '');
        if (href === currentPath || (currentPath === 'index' && href === 'index')) {
            link.classList.add('text-primary', 'font-semibold');
        }
    });

    // --- Page Routers (wrapped to catch errors) ---
    if (currentPath === 'detalle') {
        console.log('[MARIALUX] >> Routing to DETALLE');
        initDetallePage().catch(function (err) {
            console.error('[MARIALUX] Detalle init error:', err);
        });
    } else if (currentPath === 'explorador') {
        console.log('[MARIALUX] >> Routing to EXPLORADOR');
        initExploradorPage().catch(function (err) {
            console.error('[MARIALUX] Explorador init error:', err);
        });
    } else {
        console.log('[MARIALUX] >> No page-specific init for:', currentPath);
    }
}

// Robust init: works even if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', marialuxInit);
} else {
    marialuxInit();
}

// ============================================================
// PÁGINA: DETALLE (Ficha de Advocación)
// ============================================================

async function initDetallePage() {
    var urlParams = new URLSearchParams(window.location.search);
    var slug = urlParams.get('slug');

    if (!slug) {
        console.log('[MARIALUX] No slug in URL, showing default content');
        return;
    }

    // Show loading state
    var main = document.querySelector('main');
    if (main) main.style.opacity = '0.5';

    var result = await fetchAdvocacionBySlug(slug);

    if (result.error || !result.data) {
        console.error('[MARIALUX] Advocación not found for slug:', slug);
        if (main) main.style.opacity = '1';
        return;
    }

    renderDetalle(result.data);

    // Setup PDF download button
    var pdfBtn = document.querySelector('#btn-download-pdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function () {
            generatePDF(result.data);
        });
    }

    if (main) {
        main.style.transition = 'opacity 0.3s ease';
        main.style.opacity = '1';
    }
}

function clearDetalleFields() {
    // --- Reset Title ---
    var titleEl = document.querySelector('#adv-title');
    if (titleEl) titleEl.textContent = '';

    // --- Reset Document title ---
    document.title = 'Detalle | MARIALUX';

    // --- Reset Breadcrumbs ---
    var breadcrumbContinent = document.querySelector('#breadcrumb-continent');
    var breadcrumbName = document.querySelector('#breadcrumb-name');
    if (breadcrumbContinent) breadcrumbContinent.textContent = '';
    if (breadcrumbName) breadcrumbName.textContent = '';

    // --- Reset Main Image ---
    var imgEl = document.querySelector('#adv-image');
    if (imgEl) {
        imgEl.src = '';
        imgEl.alt = '';
    }
    var captionEl = document.querySelector('#adv-image-caption');
    if (captionEl) captionEl.textContent = '';

    // --- Reset Estatus Eclesiástico ---
    var estatusEl = document.querySelector('#adv-estatus');
    if (estatusEl) estatusEl.textContent = '';

    // --- Reset Key Data Grid ---
    var paisEl = document.querySelector('#adv-pais');
    if (paisEl) paisEl.textContent = '—';

    var sigloEl = document.querySelector('#adv-siglo');
    if (sigloEl) sigloEl.textContent = '—';

    var festividadEl = document.querySelector('#adv-festividad');
    if (festividadEl) festividadEl.textContent = '—';

    // --- Reset Sección: Historia ---
    var historiaEl = document.querySelector('#adv-historia');
    if (historiaEl) historiaEl.innerHTML = '';

    // --- Reset Sección: Significado Espiritual ---
    var significadoEl = document.querySelector('#adv-significado');
    if (significadoEl) significadoEl.innerHTML = '';

    var citaEl = document.querySelector('#adv-cita');
    if (citaEl) {
        citaEl.textContent = '';
        citaEl.style.display = 'none';
    }

    // --- Reset Sección: Iconografía ---
    var iconografiaList = document.querySelector('#adv-iconografia');
    if (iconografiaList) {
        iconografiaList.innerHTML = '';
        var section = iconografiaList.closest('section');
        if (section) section.style.display = 'none';
    }

    // --- Reset Sección: Notas Doctrinales ---
    var doctrinalesEl = document.querySelector('#adv-doctrinales');
    if (doctrinalesEl) doctrinalesEl.innerHTML = '';

    var referenciasEl = document.querySelector('#adv-referencias');
    if (referenciasEl) referenciasEl.innerHTML = '';

    // --- Reset Footer: Fuentes ---
    var fuentesEl = document.querySelector('#adv-fuentes');
    if (fuentesEl) fuentesEl.textContent = '';
}

function renderDetalle(adv) {
    // Clear all fields before loading new data
    clearDetalleFields();

    // --- Title ---
    var titleEl = document.querySelector('#adv-title');
    if (titleEl) titleEl.textContent = adv.nombre;

    // --- Document title ---
    document.title = adv.nombre + ' | MARIALUX';

    // --- Breadcrumbs ---
    var breadcrumbContinent = document.querySelector('#breadcrumb-continent');
    var breadcrumbName = document.querySelector('#breadcrumb-name');
    if (breadcrumbContinent && adv.paises && adv.paises.continentes) {
        breadcrumbContinent.textContent = adv.paises.continentes.nombre;
    }
    if (breadcrumbName) {
        breadcrumbName.textContent = adv.nombre;
    }

    // --- Main Image ---
    var imgEl = document.querySelector('#adv-image');
    if (imgEl && adv.imagen_url) {
        imgEl.src = adv.imagen_url;
        imgEl.alt = adv.nombre;
    }
    var captionEl = document.querySelector('#adv-image-caption');
    if (captionEl && adv.imagen_caption) {
        captionEl.textContent = adv.imagen_caption;
    }

    // --- Estatus Eclesiástico ---
    var estatusEl = document.querySelector('#adv-estatus');
    if (estatusEl) {
        estatusEl.textContent = 'Estatus Eclesiástico: ' + adv.estatus_eclesiastico;
    }

    // --- Key Data Grid ---
    var paisEl = document.querySelector('#adv-pais');
    if (paisEl && adv.paises) paisEl.textContent = adv.paises.nombre;

    var sigloEl = document.querySelector('#adv-siglo');
    if (sigloEl) sigloEl.textContent = adv.anio ? adv.siglo + ' (' + adv.anio + ')' : (adv.siglo || '—');

    var festividadEl = document.querySelector('#adv-festividad');
    if (festividadEl) festividadEl.textContent = adv.festividad || '—';

    // --- Sección: Historia ---
    var historiaEl = document.querySelector('#adv-historia');
    if (historiaEl && adv.historia) {
        var historiaParagraphs = adv.historia.split('\n\n');
        historiaEl.innerHTML = historiaParagraphs.map(function (p) {
            return '<p class="mb-4">' + escapeHtml(p) + '</p>';
        }).join('');
    }

    // --- Sección: Significado Espiritual ---
    var significadoEl = document.querySelector('#adv-significado');
    if (significadoEl && adv.significado_espiritual) {
        var sigParagraphs = adv.significado_espiritual.split('\n\n');
        significadoEl.innerHTML = sigParagraphs.map(function (p) {
            return '<p class="mb-4">' + escapeHtml(p) + '</p>';
        }).join('');
    }

    var citaEl = document.querySelector('#adv-cita');
    if (citaEl) {
        if (adv.cita_destacada) {
            citaEl.textContent = '"' + adv.cita_destacada + '"';
            citaEl.style.display = '';
        } else {
            citaEl.style.display = 'none';
        }
    }

    // --- Sección: Iconografía ---
    var iconografiaList = document.querySelector('#adv-iconografia');
    if (iconografiaList) {
        var section = iconografiaList.closest('section');
        if (adv.iconografia_items && adv.iconografia_items.length > 0) {
            iconografiaList.innerHTML = adv.iconografia_items.map(function (item) {
                return '<li><strong class="text-slate-900 dark:text-white font-display text-base">' +
                    escapeHtml(item.titulo) + ':</strong> ' + escapeHtml(item.descripcion) + '</li>';
            }).join('');
            if (section) section.style.display = '';
        } else {
            if (section) section.style.display = 'none';
        }
    }

    // --- Sección: Notas Doctrinales ---
    var doctrinalesEl = document.querySelector('#adv-doctrinales');
    if (doctrinalesEl && adv.notas_doctrinales) {
        doctrinalesEl.innerHTML = '<p>' + escapeHtml(adv.notas_doctrinales) + '</p>';
    }

    var referenciasEl = document.querySelector('#adv-referencias');
    if (referenciasEl && adv.referencias_doctrinales && adv.referencias_doctrinales.length > 0) {
        referenciasEl.innerHTML = adv.referencias_doctrinales.map(function (ref) {
            return '<div class="p-4 bg-white dark:bg-slate-800 rounded-lg text-sm border border-slate-100 dark:border-slate-700 mb-3">' +
                '<p class="font-semibold text-slate-900 dark:text-white mb-1">' + escapeHtml(ref.titulo || ref.fuente) + ':</p>' +
                '<p class="italic">"' + escapeHtml(ref.cita) + '" (' + escapeHtml(ref.fuente) + ')</p></div>';
        }).join('');
    }

    // --- Footer: Fuentes ---
    var fuentesEl = document.querySelector('#adv-fuentes');
    if (fuentesEl && adv.fuentes) {
        fuentesEl.textContent = 'Fuentes: ' + adv.fuentes;
    }
}

// ============================================================
// PDF GENERATION
// ============================================================

function generatePDF(adv) {
    if (typeof window.jspdf === 'undefined') {
        alert('Error: La librería de PDF no se cargó correctamente. Recargue la página.');
        return;
    }

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF('p', 'mm', 'a4');

    // --- Constants ---
    var pageW = 210;
    var pageH = 297;
    var marginL = 20;
    var marginR = 20;
    var contentW = pageW - marginL - marginR;
    var primaryColor = [19, 91, 236]; // #135bec
    var darkColor = [15, 23, 42];     // slate-900
    var grayColor = [100, 116, 139];  // slate-500
    var lightGray = [226, 232, 240];  // slate-200
    var y = 0;

    // --- Helper: Check page overflow ---
    function checkPage(needed) {
        if (y + needed > pageH - 25) {
            // Footer before page break
            addFooterLine();
            doc.addPage();
            y = 20;
        }
    }

    function addFooterLine() {
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(marginL, pageH - 15, pageW - marginR, pageH - 15);
        doc.setFontSize(7);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text('MARIALUX — Ficha de Advocación Mariana', marginL, pageH - 10);
        doc.text('Página ' + doc.internal.getNumberOfPages(), pageW - marginR, pageH - 10, { align: 'right' });
    }

    // --- Helper: Write wrapped text, returns new Y ---
    function writeText(text, x, startY, maxW, fontSize, color, lineH) {
        if (!text) return startY;
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        var lines = doc.splitTextToSize(text, maxW);
        for (var i = 0; i < lines.length; i++) {
            checkPage(lineH);
            doc.text(lines[i], x, y);
            y += lineH;
        }
        return y;
    }

    // ============================================
    // PAGE 1: Header
    // ============================================

    // Blue header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageW, 40, 'F');

    // MARIALUX brand
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('MARIALUX', marginL, 15);

    // Subtitle
    doc.setFontSize(7);
    doc.setTextColor(200, 220, 255);
    doc.text('FICHA DE ADVOCACIÓN MARIANA', marginL, 21);

    // Date
    var today = new Date();
    var dateStr = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    doc.text('Generado: ' + dateStr, pageW - marginR, 15, { align: 'right' });

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(adv.nombre || 'Advocación', marginL, 34);

    y = 52;

    // ============================================
    // Key Data Row
    // ============================================
    var pais = (adv.paises && adv.paises.nombre) ? adv.paises.nombre : '—';
    var continente = (adv.paises && adv.paises.continentes && adv.paises.continentes.nombre) ? adv.paises.continentes.nombre : '';
    var sigloText = adv.anio ? (adv.siglo || '') + ' (' + adv.anio + ')' : (adv.siglo || '—');
    var festividad = adv.festividad || '—';
    var estatus = adv.estatus_eclesiastico || '—';

    // Background box for key data
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginL, y - 5, contentW, 28, 3, 3, 'F');
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(marginL, y - 5, contentW, 28, 3, 3, 'S');

    var colW = contentW / 4;

    // Column 1: País
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('PAÍS DE ORIGEN', marginL + 5, y + 2);
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(pais + (continente ? ' (' + continente + ')' : ''), marginL + 5, y + 10);

    // Column 2: Siglo
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGLO', marginL + colW + 5, y + 2);
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(sigloText, marginL + colW + 5, y + 10);

    // Column 3: Festividad
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('FESTIVIDAD', marginL + colW * 2 + 5, y + 2);
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(festividad, marginL + colW * 2 + 5, y + 10);

    // Column 4: Estatus
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTATUS', marginL + colW * 3 + 5, y + 2);
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    var estatusLines = doc.splitTextToSize(estatus, colW - 8);
    doc.text(estatusLines, marginL + colW * 3 + 5, y + 10);

    y += 35;

    // ============================================
    // Section: Historia
    // ============================================
    if (adv.historia) {
        checkPage(20);
        // Section number badge
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(marginL, y - 4, 10, 7, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('01', marginL + 2.5, y + 1);

        doc.setFontSize(14);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Historia', marginL + 14, y + 1);
        y += 10;

        // Separator line
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(marginL, y, marginL + contentW, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        var paragraphs = adv.historia.split('\n\n');
        paragraphs.forEach(function (para) {
            if (para.trim()) {
                writeText(para.trim(), marginL, y, contentW, 10, grayColor, 5);
                y += 3;
            }
        });
        y += 5;
    }

    // ============================================
    // Section: Significado Espiritual
    // ============================================
    if (adv.significado_espiritual) {
        checkPage(20);
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(marginL, y - 4, 10, 7, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('02', marginL + 2.5, y + 1);

        doc.setFontSize(14);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Significado Espiritual', marginL + 14, y + 1);
        y += 10;

        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(marginL, y, marginL + contentW, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        var sigParagraphs = adv.significado_espiritual.split('\n\n');
        sigParagraphs.forEach(function (para) {
            if (para.trim()) {
                writeText(para.trim(), marginL, y, contentW, 10, grayColor, 5);
                y += 3;
            }
        });

        // Cita destacada
        if (adv.cita_destacada) {
            checkPage(15);
            y += 3;
            doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setLineWidth(1);
            doc.line(marginL + 5, y, marginL + 5, y + 10);
            doc.setFontSize(11);
            doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            doc.setFont('helvetica', 'italic');
            var citaLines = doc.splitTextToSize('"' + adv.cita_destacada + '"', contentW - 15);
            for (var c = 0; c < citaLines.length; c++) {
                checkPage(6);
                doc.text(citaLines[c], marginL + 10, y + 3);
                y += 6;
            }
            y += 5;
        }
        y += 5;
    }

    // ============================================
    // Section: Iconografía
    // ============================================
    if (adv.iconografia_items && adv.iconografia_items.length > 0) {
        checkPage(20);
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(marginL, y - 4, 10, 7, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('03', marginL + 2.5, y + 1);

        doc.setFontSize(14);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Iconografía y Simbolismo', marginL + 14, y + 1);
        y += 10;

        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(marginL, y, marginL + contentW, y);
        y += 6;

        adv.iconografia_items.forEach(function (item) {
            checkPage(12);
            // Bullet
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.circle(marginL + 3, y - 1, 1.2, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            var titleText = item.titulo + ':';
            doc.text(titleText, marginL + 7, y);

            var titleW = doc.getTextWidth(titleText) + 2;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
            var descLines = doc.splitTextToSize(item.descripcion || '', contentW - 7 - titleW);
            if (descLines.length > 0) {
                doc.text(descLines[0], marginL + 7 + titleW, y);
                y += 5;
                for (var d = 1; d < descLines.length; d++) {
                    checkPage(5);
                    doc.text(descLines[d], marginL + 7, y);
                    y += 5;
                }
            } else {
                y += 5;
            }
            y += 2;
        });
        y += 5;
    }

    // ============================================
    // Section: Notas Doctrinales & Referencias
    // ============================================
    if (adv.notas_doctrinales || (adv.referencias_doctrinales && adv.referencias_doctrinales.length > 0)) {
        checkPage(20);
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.roundedRect(marginL, y - 4, 10, 7, 1.5, 1.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('04', marginL + 2.5, y + 1);

        doc.setFontSize(14);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Notas Doctrinales', marginL + 14, y + 1);
        y += 10;

        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(marginL, y, marginL + contentW, y);
        y += 6;

        if (adv.notas_doctrinales) {
            doc.setFont('helvetica', 'normal');
            writeText(adv.notas_doctrinales, marginL, y, contentW, 10, grayColor, 5);
            y += 5;
        }

        if (adv.referencias_doctrinales && adv.referencias_doctrinales.length > 0) {
            adv.referencias_doctrinales.forEach(function (ref) {
                checkPage(18);
                // Reference box
                doc.setFillColor(248, 250, 252);
                var boxH = 16;
                doc.roundedRect(marginL, y - 2, contentW, boxH, 2, 2, 'F');
                doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.roundedRect(marginL, y - 2, contentW, boxH, 2, 2, 'S');

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
                doc.text((ref.titulo || ref.fuente) + ':', marginL + 4, y + 4);

                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
                var refText = '"' + (ref.cita || '') + '" (' + ref.fuente + ')';
                var refLines = doc.splitTextToSize(refText, contentW - 8);
                doc.text(refLines[0], marginL + 4, y + 10);

                y += boxH + 4;
            });
        }
        y += 5;
    }

    // ============================================
    // Footer (last page)
    // ============================================
    if (adv.fuentes) {
        checkPage(15);
        y += 5;
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.3);
        doc.line(marginL, y, marginL + contentW, y);
        y += 6;
        doc.setFontSize(7);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.text('Fuentes: ' + adv.fuentes, marginL, y);
    }

    // Add footer to all pages
    var totalPages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        addFooterLine();
    }

    // ============================================
    // Save
    // ============================================
    var filename = (adv.slug || 'ficha-mariana') + '.pdf';
    doc.save(filename);
    console.log('[MARIALUX] PDF generated:', filename);
}

// ============================================================
// PÁGINA: EXPLORADOR
// ============================================================

var explorerState = {
    page: 1,
    pageSize: 12,
    continente: null,
    siglo: null,
    tipoOrigen: null,
    estatus: null,
    search: '',
    orderBy: 'anio',
    ascending: true
};

async function initExploradorPage() {
    console.log('[MARIALUX] initExploradorPage START');

    // --- Read URL query params to pre-activate filters ---
    var urlParams = new URLSearchParams(window.location.search);

    var paramContinente = urlParams.get('continente');
    if (paramContinente) {
        explorerState.continente = paramContinente;
        // Check the corresponding checkbox in the UI
        var cb = document.querySelector('[data-filter-continente="' + paramContinente + '"]');
        if (cb) cb.checked = true;
        console.log('[MARIALUX] Pre-filter continente:', paramContinente);
    }

    var paramSiglo = urlParams.get('siglo');
    if (paramSiglo) {
        explorerState.siglo = paramSiglo;
        // Highlight the corresponding siglo button
        var sigloBtn = document.querySelector('[data-filter-siglo="' + paramSiglo + '"]');
        if (sigloBtn) {
            sigloBtn.classList.add('bg-primary', 'text-white', 'border-primary');
            sigloBtn.classList.remove('border-slate-200', 'dark:border-slate-700');
        }
        console.log('[MARIALUX] Pre-filter siglo:', paramSiglo);
    }

    var paramTipo = urlParams.get('tipo');
    if (paramTipo) {
        explorerState.tipoOrigen = paramTipo;
        // Set the select dropdown value
        var tipoSelect = document.querySelector('#filter-tipo-origen');
        if (tipoSelect) tipoSelect.value = paramTipo;
        console.log('[MARIALUX] Pre-filter tipo:', paramTipo);
    }

    // Load filter counts
    console.log('[MARIALUX] >> calling loadFilterOptions...');
    await loadFilterOptions();
    console.log('[MARIALUX] >> loadFilterOptions DONE');

    // Setup search
    var searchInput = document.querySelector('#explorer-search');
    var debounceTimer = null;
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                explorerState.search = e.target.value.trim();
                explorerState.page = 1;
                loadAdvocaciones().catch(function (err) {
                    console.error('[MARIALUX] Search load error:', err.message);
                });
            }, 400);
        });
    }

    // Setup continent filters
    document.querySelectorAll('[data-filter-continente]').forEach(function (checkbox) {
        checkbox.addEventListener('change', function (e) {
            explorerState.continente = e.target.checked ? e.target.dataset.filterContinente : null;
            // Uncheck others
            if (e.target.checked) {
                document.querySelectorAll('[data-filter-continente]').forEach(function (cb) {
                    if (cb !== e.target) cb.checked = false;
                });
            }
            explorerState.page = 1;
            loadAdvocaciones().catch(function (err) {
                console.error('[MARIALUX] Continent filter error:', err.message);
            });
        });
    });

    // Setup siglo filters
    document.querySelectorAll('[data-filter-siglo]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var siglo = btn.dataset.filterSiglo;
            if (explorerState.siglo === siglo) {
                explorerState.siglo = null;
                btn.classList.remove('bg-primary', 'text-white', 'border-primary');
                btn.classList.add('border-slate-200', 'dark:border-slate-700');
            } else {
                document.querySelectorAll('[data-filter-siglo]').forEach(function (b) {
                    b.classList.remove('bg-primary', 'text-white', 'border-primary');
                    b.classList.add('border-slate-200', 'dark:border-slate-700');
                });
                btn.classList.add('bg-primary', 'text-white', 'border-primary');
                btn.classList.remove('border-slate-200', 'dark:border-slate-700');
                explorerState.siglo = siglo;
            }
            explorerState.page = 1;
            loadAdvocaciones().catch(function (err) {
                console.error('[MARIALUX] Siglo filter error:', err.message);
            });
        });
    });

    // Setup tipo origen filter
    var tipoSelect = document.querySelector('#filter-tipo-origen');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', function () {
            explorerState.tipoOrigen = tipoSelect.value || null;
            explorerState.page = 1;
            loadAdvocaciones().catch(function (err) {
                console.error('[MARIALUX] Tipo filter error:', err.message);
            });
        });
    }

    // Setup estatus filter
    document.querySelectorAll('[data-filter-estatus]').forEach(function (el) {
        el.addEventListener('click', function () {
            var estatus = el.dataset.filterEstatus;
            explorerState.estatus = (explorerState.estatus === estatus) ? null : estatus;
            explorerState.page = 1;
            loadAdvocaciones().catch(function (err) {
                console.error('[MARIALUX] Estatus filter error:', err.message);
            });
        });
    });

    // Setup clear filters
    var clearBtn = document.querySelector('#clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            explorerState.page = 1;
            explorerState.continente = null;
            explorerState.siglo = null;
            explorerState.tipoOrigen = null;
            explorerState.estatus = null;
            explorerState.search = '';

            document.querySelectorAll('[data-filter-continente]').forEach(function (cb) {
                cb.checked = false;
            });
            document.querySelectorAll('[data-filter-siglo]').forEach(function (b) {
                b.classList.remove('bg-primary', 'text-white', 'border-primary');
                b.classList.add('border-slate-200', 'dark:border-slate-700');
            });
            if (tipoSelect) tipoSelect.value = '';
            if (searchInput) searchInput.value = '';

            loadAdvocaciones().catch(function (err) {
                console.error('[MARIALUX] Clear filters error:', err.message);
            });
        });
    }

    // Initial load
    console.log('[MARIALUX] >> calling initial loadAdvocaciones...');
    await loadAdvocaciones();
    console.log('[MARIALUX] initExploradorPage COMPLETE');
}

async function loadFilterOptions() {
    console.log('[MARIALUX] loadFilterOptions START');
    try {
        var counts = await fetchEstatusCounts();
        document.querySelectorAll('[data-filter-estatus]').forEach(function (el) {
            var estatus = el.dataset.filterEstatus;
            var countEl = el.querySelector('[data-estatus-count]');
            if (countEl) {
                countEl.textContent = counts[estatus] || 0;
            }
        });
    } catch (err) {
        console.error('[MARIALUX] loadFilterOptions error:', err.message);
    }
}

async function loadAdvocaciones() {
    console.log('[MARIALUX] loadAdvocaciones START, state:', JSON.stringify(explorerState));
    var grid = document.querySelector('#explorer-grid');
    var resultsTitle = document.querySelector('#explorer-results-title');
    var resultsCount = document.querySelector('#explorer-results-count');

    console.log('[MARIALUX] grid found:', !!grid);
    if (!grid) return;

    // Loading state
    grid.style.opacity = '0.4';
    grid.style.transition = 'opacity 0.2s ease';

    try {
        console.log('[MARIALUX] >> calling fetchAdvocaciones...');
        var result = await fetchAdvocaciones(explorerState);
        console.log('[MARIALUX] >> fetchAdvocaciones returned:', result.error ? 'ERROR' : 'OK', 'count:', result.count, 'data.length:', result.data ? result.data.length : 0);

        if (result.error) {
            grid.innerHTML = '<div class="col-span-full text-center py-16 text-slate-500">' +
                '<span class="material-icons text-4xl mb-4 block">error_outline</span>' +
                'Error al cargar los datos. Intente de nuevo.</div>';
            grid.style.opacity = '1';
            return;
        }

        var data = result.data;
        var count = result.count;

        // Update results info
        if (resultsTitle) {
            var filterLabel = '';
            if (explorerState.continente) {
                filterLabel = ' en ' + explorerState.continente.charAt(0).toUpperCase() + explorerState.continente.slice(1);
            }
            resultsTitle.textContent = 'Resultados' + filterLabel;
        }
        if (resultsCount) {
            resultsCount.textContent = 'Mostrando ' + data.length + ' de ' + count + ' advocaciones encontradas';
        }

        // Render cards
        if (data.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-16 text-slate-500">' +
                '<span class="material-icons text-4xl mb-4 block">search_off</span>' +
                '<p class="text-lg font-semibold mb-2">Sin resultados</p>' +
                '<p class="text-sm">Intente con otros filtros o términos de búsqueda.</p></div>';
        } else {
            grid.innerHTML = data.map(function (adv) {
                return renderCard(adv);
            }).join('');
        }

        grid.style.opacity = '1';

        // Render pagination
        renderPagination(count);

    } catch (err) {
        console.error('[MARIALUX] loadAdvocaciones error:', err.message);
        grid.innerHTML = '<div class="col-span-full text-center py-16 text-slate-500">' +
            '<span class="material-icons text-4xl mb-4 block">error_outline</span>' +
            'Error inesperado. Recargue la página.</div>';
        grid.style.opacity = '1';
    }
}

function renderCard(adv) {
    var pais = (adv.paises && adv.paises.nombre) ? adv.paises.nombre : '';
    var sigloLabel = adv.siglo ? adv.siglo.replace('Siglo ', 'S. ') : '';
    var nombre = escapeHtml(adv.nombre);
    var descripcion = escapeHtml(adv.descripcion_corta || '');
    var estatus = escapeHtml(adv.estatus_eclesiastico || '');

    var imgHtml = adv.imagen_url
        ? '<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="' +
        adv.imagen_url + '" alt="' + nombre + '" loading="lazy" />'
        : '<div class="w-full h-full flex items-center justify-center"><span class="material-icons text-6xl text-slate-300">image</span></div>';

    var sigloHtml = sigloLabel
        ? '<div class="absolute top-3 left-3"><span class="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm">' + sigloLabel + '</span></div>'
        : '';

    return '<a href="detalle.html?slug=' + adv.slug + '"' +
        ' class="advocation-card group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col no-underline text-inherit">' +
        '<div class="relative aspect-[4/5] overflow-hidden m-4 rounded-lg bg-slate-50 dark:bg-slate-800">' +
        imgHtml +
        '<div class="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg"></div>' +
        sigloHtml +
        '</div>' +
        '<div class="px-6 pb-6 flex-1 flex flex-col">' +
        '<span class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">' + escapeHtml(pais) + '</span>' +
        '<h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">' + nombre + '</h3>' +
        '<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">' + descripcion + '</p>' +
        '<div class="mt-auto flex items-center justify-between">' +
        '<span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded">' + estatus + '</span>' +
        '<span class="material-icons text-slate-400 hover:text-primary transition-colors text-xl">bookmark_border</span>' +
        '</div></div></a>';
}

function renderPagination(totalCount) {
    var paginationEl = document.querySelector('#explorer-pagination');
    if (!paginationEl) return;

    var totalPages = Math.ceil(totalCount / explorerState.pageSize);
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    var current = explorerState.page;
    var pages = [];

    // Logic for page numbers (show 5 around current)
    if (totalPages <= 7) {
        for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (current > 3) pages.push('...');
        for (var j = Math.max(2, current - 1); j <= Math.min(totalPages - 1, current + 1); j++) {
            pages.push(j);
        }
        if (current < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    var btnActive = 'w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md';
    var btnNormal = 'w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary hover:text-primary hover:bg-white dark:hover:bg-slate-900 transition-all';
    var btnDisabled = 'w-10 h-10 flex items-center justify-center rounded-lg border border-slate-100 dark:border-slate-800 text-slate-300 pointer-events-none opacity-50';

    // Helper for buttons
    function createBtn(page, icon, disabled, tooltip) {
        var cls = disabled ? btnDisabled : btnNormal;
        return '<button title="' + tooltip + '" data-page="' + page + '" ' + (disabled ? 'disabled' : '') +
            ' class="' + cls + '">' +
            '<span class="material-icons">' + icon + '</span></button>';
    }

    var html = '';

    // First Page (=|<)
    html += createBtn(1, 'first_page', current === 1, 'Ir al inicio');

    // Prev Page (<)
    html += createBtn(current - 1, 'chevron_left', current === 1, 'Anterior');

    // Page Numbers
    pages.forEach(function (p) {
        if (p === '...') {
            html += '<span class="px-2 text-slate-400 self-center">...</span>';
        } else {
            var cls = (p === current) ? btnActive : btnNormal;
            html += '<button data-page="' + p + '" class="' + cls + '">' + p + '</button>';
        }
    });

    // Next Page (>)
    html += createBtn(current + 1, 'chevron_right', current === totalPages, 'Siguiente');

    // Last Page (>|)
    html += createBtn(totalPages, 'last_page', current === totalPages, 'Ir al final');

    paginationEl.innerHTML = html;

    // Pagination click handlers
    paginationEl.querySelectorAll('button[data-page]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn.disabled) return;
            var page = parseInt(btn.dataset.page);
            if (page >= 1 && page <= totalPages && page !== current) {
                explorerState.page = page;
                loadAdvocaciones().catch(function (err) {
                    console.error('[MARIALUX] Pagination error:', err.message);
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// ============================================================
// UTILS
// ============================================================

function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
