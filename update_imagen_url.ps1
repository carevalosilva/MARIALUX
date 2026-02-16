# ============================================================
# MARIALUX — Script para actualizar imagen_url en Supabase
# ============================================================
# Este script:
# 1. Lee todas las advocaciones de Supabase (slug + imagen_url actual)
# 2. Busca en la carpeta "virgenes" la imagen .webp que más coincida con el slug
# 3. Actualiza el campo imagen_url con la ruta relativa "virgenes/<archivo>.webp"
# 4. Solo actualiza registros que NO tienen imagen_url (no sobreescribe las existentes)
#
# Utiliza la API REST de Supabase directamente.
# ============================================================

$SUPABASE_URL = "https://abkseebmtwmfxmrgiqgr.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFia3NlZWJtdHdtZnhtcmdpcWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzQwODIsImV4cCI6MjA4NjQxMDA4Mn0.4C0l888NPcbCnX3Eb1aYRa5AcscBdUWn7gtnMXOa0aY"
$VIRGENES_DIR = "d:\Antigravity\MARIALUX\virgenes"

$headers = @{
    "apikey"        = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=minimal"
}

# --- Paso 1: Obtener todas las imágenes disponibles ---
Write-Host "`n=== PASO 1: Listando imágenes en carpeta virgenes ===" -ForegroundColor Cyan
$imageFiles = Get-ChildItem -Path $VIRGENES_DIR -Filter "*.webp" | Select-Object -ExpandProperty Name
Write-Host "  Total imágenes: $($imageFiles.Count)" -ForegroundColor Green

# Crear un diccionario slug -> archivo (sin extensión)
$imageMap = @{}
foreach ($file in $imageFiles) {
    $slug = $file -replace '\.webp$', ''
    $imageMap[$slug] = $file
}

# --- Paso 2: Obtener advocaciones de Supabase ---
Write-Host "`n=== PASO 2: Leyendo advocaciones de Supabase ===" -ForegroundColor Cyan
$getHeaders = @{
    "apikey"        = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
}
$response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/advocaciones?select=id,nombre,slug,imagen_url&publicado=eq.true&order=nombre" -Headers $getHeaders
Write-Host "  Total advocaciones: $($response.Count)" -ForegroundColor Green

# --- Paso 3: Buscar coincidencias ---
Write-Host "`n=== PASO 3: Buscando coincidencias slug <-> imagen ===" -ForegroundColor Cyan

$matches = @()
$noMatch = @()
$alreadyHasImage = @()

foreach ($adv in $response) {
    $slug = $adv.slug

    # Si ya tiene imagen_url, no sobreescribir
    if ($adv.imagen_url -and $adv.imagen_url -ne '') {
        $alreadyHasImage += [PSCustomObject]@{
            Nombre   = $adv.nombre
            Slug     = $slug
            ImageURL = $adv.imagen_url.Substring(0, [Math]::Min(60, $adv.imagen_url.Length)) + "..."
        }
        continue
    }

    # Coincidencia EXACTA: slug == nombre archivo (sin extensión)
    if ($imageMap.ContainsKey($slug)) {
        $matches += [PSCustomObject]@{
            Id        = $adv.id
            Nombre    = $adv.nombre
            Slug      = $slug
            Archivo   = $imageMap[$slug]
            TipoMatch = "EXACTA"
        }
        continue
    }

    # Coincidencia PARCIAL: buscar archivos que contengan el slug o viceversa
    $bestMatch = $null
    $bestScore = 0

    foreach ($imgSlug in $imageMap.Keys) {
        # Verificar si uno contiene al otro
        if ($imgSlug -like "*$slug*" -or $slug -like "*$imgSlug*") {
            $score = [Math]::Min($slug.Length, $imgSlug.Length) / [Math]::Max($slug.Length, $imgSlug.Length)
            if ($score -gt $bestScore) {
                $bestScore = $score
                $bestMatch = $imgSlug
            }
        }

        # Verificar coincidencia por palabras clave
        $slugWords = $slug -split '-'
        $imgWords = $imgSlug -split '-'
        $commonWords = ($slugWords | Where-Object { $imgWords -contains $_ }).Count
        $totalWords = [Math]::Max($slugWords.Count, $imgWords.Count)
        $wordScore = $commonWords / $totalWords

        if ($wordScore -gt 0.6 -and $wordScore -gt $bestScore) {
            $bestScore = $wordScore
            $bestMatch = $imgSlug
        }
    }

    if ($bestMatch -and $bestScore -gt 0.5) {
        $matches += [PSCustomObject]@{
            Id        = $adv.id
            Nombre    = $adv.nombre
            Slug      = $slug
            Archivo   = $imageMap[$bestMatch]
            TipoMatch = "PARCIAL ($([Math]::Round($bestScore * 100))%)"
        }
    }
    else {
        $noMatch += [PSCustomObject]@{
            Nombre = $adv.nombre
            Slug   = $slug
        }
    }
}

# --- Paso 4: Mostrar resultados ---
Write-Host "`n=== RESULTADOS ===" -ForegroundColor Yellow

Write-Host "`n--- Ya tienen imagen ($($alreadyHasImage.Count)) ---" -ForegroundColor DarkGray
$alreadyHasImage | Format-Table -AutoSize

Write-Host "`n--- Coincidencias encontradas ($($matches.Count)) ---" -ForegroundColor Green
$matches | Format-Table -Property Nombre, Slug, Archivo, TipoMatch -AutoSize

Write-Host "`n--- Sin coincidencia ($($noMatch.Count)) ---" -ForegroundColor Red
$noMatch | Format-Table -AutoSize

# --- Paso 5: Confirmar y ejecutar actualizaciones ---
Write-Host "`n=== PASO 5: Actualización ===" -ForegroundColor Cyan
Write-Host "  Se actualizarán $($matches.Count) registros con rutas locales (virgenes/<archivo>.webp)" -ForegroundColor Yellow

$confirm = Read-Host "¿Desea proceder? (s/n)"
if ($confirm -ne 's') {
    Write-Host "Cancelado por el usuario." -ForegroundColor Red
    exit
}

$updated = 0
$errors = 0

foreach ($match in $matches) {
    $imageUrl = "virgenes/$($match.Archivo)"
    
    try {
        $body = @{ imagen_url = $imageUrl } | ConvertTo-Json
        $patchUrl = "$SUPABASE_URL/rest/v1/advocaciones?id=eq.$($match.Id)"
        
        Invoke-RestMethod -Uri $patchUrl -Method Patch -Headers $headers -Body $body | Out-Null
        $updated++
        Write-Host "  [OK] $($match.Nombre) -> $imageUrl" -ForegroundColor Green
    }
    catch {
        $errors++
        Write-Host "  [ERROR] $($match.Nombre): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== RESUMEN FINAL ===" -ForegroundColor Yellow
Write-Host "  Actualizados: $updated" -ForegroundColor Green
Write-Host "  Errores: $errors" -ForegroundColor Red
Write-Host "  Ya tenían imagen: $($alreadyHasImage.Count)" -ForegroundColor DarkGray
Write-Host "  Sin coincidencia: $($noMatch.Count)" -ForegroundColor Red
Write-Host "  Total advocaciones: $($response.Count)" -ForegroundColor White
