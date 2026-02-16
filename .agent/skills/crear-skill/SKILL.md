---
name: crear-skill
description: Guía para crear nuevas skills en Antigravity. Usar cuando el usuario pida crear, configurar o documentar una skill para el agente. Incluye estructura de archivos, formato SKILL.md, convenciones de nombres, ejemplos y buenas prácticas.
---

# Crear Skills en Antigravity

## ¿Qué es una Skill?

Una **skill** es un paquete reutilizable de conocimiento que extiende las capacidades del agente. Cada skill contiene instrucciones para abordar una tarea específica, buenas prácticas, y opcionalmente scripts o recursos auxiliares.

Cuando el agente inicia una conversación, revisa la lista de skills disponibles (nombre + descripción). Si una skill es relevante para la tarea actual, lee sus instrucciones completas y las sigue. Las skills se cargan **bajo demanda** para optimizar el contexto.

---

## Estructura de Archivos

```
.agent/skills/<nombre-skill>/
├── SKILL.md              # (Obligatorio) Instrucciones principales
├── scripts/              # (Opcional) Scripts auxiliares
│   ├── setup.sh
│   └── validate.py
├── examples/             # (Opcional) Implementaciones de referencia
│   └── ejemplo.md
└── resources/            # (Opcional) Templates, assets, archivos adicionales
    └── template.json
```

### Ubicaciones válidas

| Tipo | Ruta | Uso |
|------|------|-----|
| **Workspace** | `<raíz-proyecto>/.agent/skills/<nombre>/` | Skills específicas del proyecto actual |
| **Global** | `~/.gemini/antigravity/skills/<nombre>/` | Skills personales, disponibles en todos los proyectos |

> Las skills de workspace tienen prioridad sobre las globales si comparten el mismo nombre.

---

## Formato del archivo SKILL.md

El archivo `SKILL.md` tiene dos partes obligatorias:

### 1. YAML Frontmatter (metadatos)

```yaml
---
name: nombre-de-la-skill
description: Descripción concisa de qué hace esta skill y cuándo usarla. El agente usa este campo para decidir si la skill es relevante para la tarea actual del usuario.
---
```

**Reglas del frontmatter:**
- `name`: Identificador único de la skill (kebab-case recomendado)
- `description`: Una oración clara que describa el propósito y cuándo activarla. **Esta es la clave para que el agente la detecte automáticamente**. Incluir palabras clave relevantes.

### 2. Cuerpo Markdown (instrucciones)

El cuerpo contiene las instrucciones detalladas que el agente seguirá. Debe ser:
- **Específico**: Pasos exactos, no ambiguos
- **Accionable**: El agente debe poder ejecutar cada paso
- **Completo**: Cubrir el flujo completo, incluyendo casos de error
- **Conciso**: No incluir información irrelevante

---

## Paso a Paso para Crear una Skill

### Paso 1: Definir el propósito
Responder estas preguntas:
- ¿Qué tarea específica resuelve?
- ¿Cuándo debería activarse?
- ¿Qué herramientas/comandos necesita usar?
- ¿Es específica del proyecto o genérica?

### Paso 2: Crear la carpeta
```bash
# Skill para este proyecto
mkdir -p .agent/skills/<nombre-skill>

# Skill global (todos los proyectos)
mkdir -p ~/.gemini/antigravity/skills/<nombre-skill>
```

### Paso 3: Escribir el SKILL.md

Usar esta plantilla:

```markdown
---
name: mi-skill
description: [Verbo] [qué hace] [cuándo usarla]. Ejemplo: "Despliega la aplicación a producción cuando el usuario pide deploy o publicar."
---

# [Título de la Skill]

## Cuándo usar esta skill
- Condición 1 de activación
- Condición 2 de activación

## Prerrequisitos
- Herramienta X instalada
- Archivo de configuración Y presente

## Instrucciones

### 1. [Primer paso]
Descripción detallada del paso.

```comando
ejemplo de comando a ejecutar
```

### 2. [Segundo paso]
...

## Manejo de errores
- Si ocurre X, hacer Y
- Si falta Z, preguntar al usuario

## Notas importantes
- Advertencia 1
- Restricción 2
```

### Paso 4: (Opcional) Agregar scripts auxiliares

Si la skill necesita ejecutar lógica compleja, crear scripts en `scripts/`:

```bash
# scripts/setup.sh
#!/bin/bash
echo "Configurando ambiente..."
```

Referenciarlos desde SKILL.md:
```markdown
Ejecutar el script de setup:
```bash
bash .agent/skills/mi-skill/scripts/setup.sh
```
```

### Paso 5: (Opcional) Agregar ejemplos

Incluir archivos de ejemplo en `examples/` para que el agente tenga referencia de implementaciones correctas.

### Paso 6: Verificar

La skill está disponible inmediatamente. Probar pidiendo al agente una tarea que coincida con la `description` del frontmatter.

---

## Buenas Prácticas

1. **Descripción como trigger**: La `description` es lo que el agente usa para decidir si leer la skill. Incluir sinónimos y palabras clave del dominio.

2. **Instrucciones imperativas**: Escribir en modo imperativo ("Ejecutar", "Verificar", "Crear") en vez de descriptivo.

3. **Rutas absolutas**: Siempre usar rutas absolutas en comandos o indicar cómo construirlas.

4. **Idempotencia**: Las instrucciones deben poder ejecutarse múltiples veces sin efectos adversos.

5. **Manejo de errores**: Incluir siempre una sección de troubleshooting con los errores más comunes.

6. **Minimizar tamaño**: Cada skill se carga en el contexto del agente. Mantenerlas concisas para no desperdiciar tokens.

7. **Una skill, un propósito**: Evitar skills que hagan demasiadas cosas. Mejor crear varias skills enfocadas.

8. **No duplicar conocimiento general**: Las skills son para conocimiento específico del proyecto o flujos concretos, no para enseñar conceptos generales.

---

## Ejemplo Completo: Skill para Deploy

```
.agent/skills/deploy-produccion/
├── SKILL.md
└── scripts/
    └── pre-deploy-check.sh
```

**SKILL.md:**
```markdown
---
name: deploy-produccion
description: Despliega la aplicación a producción. Usar cuando el usuario pida hacer deploy, publicar, subir a producción, o poner en vivo la app.
---

# Deploy a Producción

## Cuándo usar
- El usuario dice "deploy", "publicar", "subir a producción"
- Se confirman los cambios listos para publicar

## Prerrequisitos
- Node.js >= 18
- Variables de entorno configuradas en `.env.production`
- Tests pasando

## Instrucciones

### 1. Verificar estado
Ejecutar tests y validar que no hay errores:
```bash
npm run test
npm run build
```

### 2. Pre-deploy checks
```bash
bash .agent/skills/deploy-produccion/scripts/pre-deploy-check.sh
```

### 3. Desplegar
```bash
npm run deploy
```

### 4. Verificar
Confirmar que la URL de producción responde correctamente.

## Errores comunes
- **Build falla**: Verificar dependencias con `npm ci`
- **Tests fallan**: No proceder con deploy hasta resolver
```
