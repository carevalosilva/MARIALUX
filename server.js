// ============================================================
// MARIALUX — Local Dev Server (Express)
// Serves static files + handles image uploads to virgenes/
// ============================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ── Ensure virgenes/ folder exists ──────────────────────────
const VIRGENES_DIR = path.join(__dirname, 'virgenes');
if (!fs.existsSync(VIRGENES_DIR)) {
    fs.mkdirSync(VIRGENES_DIR, { recursive: true });
}

// ── Multer config: temp storage, then rename ────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (jpg, png, gif, webp, svg, avif)'));
        }
    }
});

// ── Upload endpoint ─────────────────────────────────────────
app.post('/api/upload-image', upload.single('imagen'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo' });
        }

        const slug = req.body.slug;
        if (!slug) {
            return res.status(400).json({ error: 'El campo slug es requerido' });
        }

        // Get extension from original filename
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = slug + ext;
        const filepath = path.join(VIRGENES_DIR, filename);

        // Write file
        fs.writeFileSync(filepath, req.file.buffer);

        const relativePath = 'virgenes/' + filename;
        console.log('[Upload] Imagen guardada:', relativePath);

        res.json({ success: true, path: relativePath });
    } catch (err) {
        console.error('[Upload] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ── Static files (must be AFTER API routes) ─────────────────
// Clean URLs: serve .html files without extension
app.use((req, res, next) => {
    // Skip API routes and files with extensions
    if (req.path.startsWith('/api/') || path.extname(req.path)) {
        return next();
    }
    // Try to serve .html file
    const htmlPath = path.join(__dirname, req.path + '.html');
    if (fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
    }
    next();
});

app.use(express.static(__dirname, {
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache');
    }
}));

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('  ✝  MARIALUX Dev Server');
    console.log('  ─────────────────────────');
    console.log('  🌐 http://localhost:' + PORT);
    console.log('  📁 Admin: http://localhost:' + PORT + '/admin');
    console.log('  📷 Upload endpoint: POST /api/upload-image');
    console.log('');
});
