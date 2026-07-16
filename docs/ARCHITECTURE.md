# Aura Inventory — Arquitectura

> Documento vivo. Toda decisión relevante se registra aquí (o como ADR en `docs/adr/`)
> antes de implementarse.

## 1. Visión técnica

PWA offline-first para inventariar cualquier activo físico. El backend es **opcional
por diseño**: la app debe ser 100% funcional sin red. La nube (Supabase/Firebase/VPS)
llegará después como capa de sincronización, no como dependencia.

Principio rector: **local-first**. IndexedDB es la fuente de verdad; cualquier
sincronización futura se monta encima sin tocar la UI.

## 2. Stack (confirmado)

| Capa         | Tecnología                                             | Notas                                                         |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------- |
| Build        | Vite + TypeScript (strict)                             | Misma base que Aura Music → consistencia del ecosistema       |
| UI           | React 18, TailwindCSS v4, shadcn/ui (Radix)            | Componentes propios estilo shadcn, tematizados por ADS        |
| Animación    | Framer Motion                                          | Transiciones de página, microinteracciones, layout animations |
| Routing      | React Router                                           | BrowserRouter + truco `404.html` para GitHub Pages            |
| Estado UI    | Zustand                                                | Solo estado efímero de UI (modales, filtros activos, tema)    |
| Datos        | TanStack Query sobre repositorios                      | Ver §4 — clave para el backend intercambiable                 |
| Persistencia | Dexie (IndexedDB)                                      | Objetos, blobs de fotos, adjuntos PDF                         |
| Búsqueda     | Índice full-text en Web Worker (MiniSearch/FlexSearch) | Instantánea con 50k+ objetos                                  |
| PWA          | vite-plugin-pwa (Workbox)                              | Precache del shell, instalable, offline total                 |
| i18n         | react-i18next (es/en)                                  | Igual que Aura Music                                          |

## 3. Capas (Clean Architecture, pragmática)

```
src/
├── domain/          # Entidades, tipos, reglas de negocio puras. Sin React, sin Dexie.
│   ├── entities/    # Item, Photo, Room, Category, Tag, Collection, ItemEvent, Loan, Reminder
│   └── validation/  # Esquemas (zod) y reglas
├── data/            # Implementaciones de persistencia
│   ├── db/          # Esquema Dexie, migraciones
│   ├── repositories/# ItemRepository, PhotoRepository... (implementan interfaces de domain)
│   └── search/      # Índice de búsqueda + worker
├── application/     # Casos de uso / servicios (importar, exportar, comprimir foto, recordatorios)
│   ├── services/
│   └── queries/     # Hooks TanStack Query que envuelven repositorios
├── design-system/   # ADS: tokens, primitivas, componentes base (futuro paquete @aura/ui)
├── features/        # Vertical slices: inventory/, passport/, map/, dashboard/, search/...
│   └── <feature>/{components,hooks,stores}
├── pages/           # Composición de features por ruta
├── layouts/
├── stores/          # Zustand global (tema, preferencias)
├── config/          # Rutas, constantes, feature flags
├── utils/
└── assets/
```

Reglas de dependencia (se harán cumplir con ESLint `import/no-restricted-paths`):

- `domain` no importa de nadie.
- `data` y `application` importan de `domain`.
- `features/pages` importan de `application` y `design-system`; **nunca** de `data` directamente.
- `design-system` no conoce el dominio (es genérico, extraíble a `@aura/ui`).

## 4. Decisión clave: repositorios + TanStack Query

Las interfaces de repositorio viven en `domain`; la implementación Dexie en `data`.
La UI consume hooks (`useItems()`, `useItem(id)`) construidos con TanStack Query.

Por qué importa: cuando llegue la nube, se crea `SupabaseItemRepository` con la misma
interfaz y una capa de sync (outbox + last-write-wins con `updatedAt`); la UI no cambia
ni una línea. Los IDs son **UUID v4 generados en cliente** desde el día 1 para que la
sincronización futura no requiera re-mapear claves.

Para listas reactivas locales se permite `useLiveQuery` de Dexie dentro de
`application/queries` — la UI sigue sin saber qué hay debajo.

## 5. Modelo de datos (resumen — detalle en DATA_MODEL.md)

Entidades: `Item` (núcleo, ~30 campos), `Photo` (blob + thumbnail), `Attachment`
(facturas/manuales PDF), `Category`/`Subcategory`, `Room`, `Location`, `Tag`,
`Collection`, `ItemEvent` (línea de tiempo: compra, mantenimiento, préstamo,
movimiento, comentario), `Loan`, `Reminder`.

El **Pasaporte Digital** no es una entidad: es la composición de
`Item + Photos + Attachments + ItemEvents + Loan activo`, renderizada como ficha premium.
Todo evento relevante (cambio de ubicación, préstamo, mantenimiento) escribe un
`ItemEvent`, lo que da la línea de tiempo "gratis".

## 6. Fotografías

- Captura/selección → compresión en cliente (`createImageBitmap` + `OffscreenCanvas` → WebP).
- Se guardan **dos blobs**: original comprimido (~1600px) y thumbnail (~320px).
- Los grids solo cargan thumbnails con lazy loading + `content-visibility`.
- Blobs en tabla Dexie separada de los metadatos → listar 50k items nunca deserializa imágenes.

## 7. Rendimiento (presupuesto: 50,000 objetos)

- Virtualización de listas/grids con TanStack Virtual.
- Búsqueda en Web Worker con índice incremental (add/update/delete por item).
- Índices Dexie sobre `categoryId`, `roomId`, `updatedAt`, `tags` (multiEntry), `favorite`.
- Dashboard: agregados calculados con cursores Dexie y cacheados con TanStack Query.
- Code splitting por ruta; Framer Motion con `LazyMotion`.

## 8. PWA y deploy

- GitHub Pages bajo `/AuraInventory/` → `base` en Vite + truco SPA `404.html`.
- Workbox: precache del shell, runtime cache para assets; los datos ya viven en IndexedDB.
- Nota operativa: GitHub Actions está bloqueado en la cuenta (billing lock, mismo caso
  que Aura Music) → deploy manual: build + push de `dist` a rama `gh-pages`.

## 9. Ecosistema Aura

`design-system/` se escribe como si fuera un paquete independiente (sin imports del
dominio, tokens en CSS variables). Cuando el ecosistema tenga 2+ apps consumidoras se
extrae a un repo/paquete `@aura/ui`. No se monta un monorepo hoy: sería complejidad
sin retorno con una sola app nueva.

## 10. Calidad

- TypeScript strict, ESLint (+ reglas de capas), Prettier.
- Vitest + Testing Library: dominio y servicios con unit tests; features críticas con
  tests de componente.
- CI local (script `verify`: typecheck + lint + test + build) mientras Actions esté bloqueado.
- Convención de commits: Conventional Commits (`feat:`, `fix:`, `docs:`...).
