---
name: supabase_management_skill
description: Skill profesional para la gestión completa de datos e infraestructura en Supabase (CRUD, Joins, Paginación, Tablas y Vistas).
---

# Supabase Management Skill

**Versión:** 1.0.0  
**Runtime:** nodejs20

---

## Configuración Requerida

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase (ej. `https://xyz.supabase.co`) |
| `SUPABASE_KEY` | Clave API (Anon o Service Role para DDL) |

---

## Acciones

### 📖 LECTURA Y FILTROS

#### `fetch_data_advanced`

> Consulta registros con filtros avanzados, orden y paginación.

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `table` | string | — | Nombre de la tabla |
| `page` | integer | `1` | Número de página |
| `pageSize` | integer | `10` | Registros por página |
| `filters` | array | — | Lista de filtros (ver estructura abajo) |
| `order` | object | — | Configuración de ordenamiento |

**Estructura de `filters`:**

Cada filtro es un objeto con las siguientes propiedades:

| Propiedad | Tipo | Descripción |
|---|---|---|
| `column` | string | Nombre de la columna a filtrar |
| `operator` | string | Operador: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `ilike`, `in`, `is` |
| `value` | any | Valor contra el que se compara |

**Estructura de `order`:**

| Propiedad | Tipo | Default | Descripción |
|---|---|---|---|
| `column` | string | `"id"` | Columna por la que se ordena |
| `ascending` | boolean | `true` | Orden ascendente o descendente |

**Ejemplo de uso:**

```javascript
// Consulta paginada con filtros
const result = await supabase
  .from('productos')
  .select('*', { count: 'exact' })
  .ilike('nombre', '%rosa%')
  .gte('precio', 100)
  .order('precio', { ascending: true })
  .range(0, 9); // página 1, 10 registros
```

---

### 🔗 RELACIONES (JOINS)

#### `fetch_with_relations`

> Realiza consultas que incluyen datos de tablas relacionadas (Joins).

**Parámetros:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `table` | string | Tabla principal |
| `select` | string | Columnas y relaciones, ej: `'id, nombre, perfiles(avatar_url)'` |
| `filters` | array | Misma estructura de filtros que `fetch_data_advanced` |

**Ejemplo de uso:**

```javascript
// Join entre pedidos y clientes
const result = await supabase
  .from('pedidos')
  .select('id, total, clientes(nombre, email)')
  .eq('estado', 'activo');
```

---

### ✏️ ESCRITURA INTELIGENTE

#### `upsert_data`

> Crea un registro o lo actualiza si ya existe basándose en un conflicto de columna.

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `table` | string | — | Nombre de la tabla |
| `payload` | object | — | Datos a insertar o actualizar |
| `onConflictColumn` | string | `"id"` | Columna única para verificar duplicados |

**Ejemplo de uso:**

```javascript
// Insertar o actualizar un producto
const { data, error } = await supabase
  .from('productos')
  .upsert(
    { id: 'abc-123', nombre: 'Rosa Mística', precio: 250 },
    { onConflict: 'id' }
  );
```

---

### 🏗️ INFRAESTRUCTURA (DDL)

> ⚠️ Estas acciones requieren permisos de administrador (Service Role Key).

#### `create_table`

> Crea una nueva tabla físicamente en la base de datos.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `tableName` | string | Nombre de la nueva tabla |
| `columns` | string | Definición SQL de columnas, ej: `'id uuid primary key, nombre text'` |

**Ejemplo de uso:**

```sql
-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);
```

#### `create_view`

> Crea una vista SQL para simplificar consultas complejas.

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `viewName` | string | — | Nombre de la vista |
| `sourceTable` | string | — | Tabla fuente |
| `select` | string | `"*"` | Columnas a seleccionar |
| `where` | string | `"true"` | Condición WHERE |

**Ejemplo de uso:**

```sql
-- Vista de productos activos
CREATE OR REPLACE VIEW productos_activos AS
SELECT * FROM productos WHERE activo = true;
```

---

### 🗑️ ELIMINACIÓN

#### `delete_data`

> Elimina registros que coincidan con un filtro.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `table` | string | Nombre de la tabla |
| `match` | object | Objeto clave-valor para identificar qué borrar |

**Ejemplo de uso:**

```javascript
// Eliminar un registro específico
const { data, error } = await supabase
  .from('productos')
  .delete()
  .match({ id: 'abc-123' });
```

---

## Notas Importantes

1. **Paginación:** Usa `range(from, to)` donde `from = (page - 1) * pageSize` y `to = from + pageSize - 1`.
2. **Filtros:** Los operadores disponibles mapean directamente a los métodos del cliente Supabase JS (`eq()`, `neq()`, `gt()`, `gte()`, `lt()`, `lte()`, `ilike()`, `in()`, `is()`).
3. **Joins:** Supabase infiere las relaciones automáticamente si existen Foreign Keys definidas en la base de datos.
4. **DDL:** Las operaciones `create_table` y `create_view` se ejecutan mediante `apply_migration` o `execute_sql` del MCP de Supabase.
5. **Upsert:** Asegúrate de que la columna `onConflictColumn` tenga un índice UNIQUE para que el upsert funcione correctamente.
