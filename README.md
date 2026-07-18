<div align="center">

# ✦ Aura Inventory

**Todo lo que tienes, hermoso y en un solo lugar. Offline primero, siempre contigo.**

PWA instalable para inventariar cualquier objeto físico — casa, oficina, taller, colecciones —
con fotos, documentos, historial y un mapa de tu casa. Sin cuentas, sin servidor: tus datos
viven en tu dispositivo.

**[✨ Probar en vivo](https://mamueljr.github.io/AuraInventory/)**

`React 19` · `TypeScript 6 strict` · `Vite 8` · `Tailwind 4` · `Dexie (IndexedDB)` · `PWA offline`

</div>

---

## Qué hace

- **📦 Registro visual** — formulario por pasos, fotos desde la cámara comprimidas a WebP
  (miniaturas para el grid), 30+ campos por objeto.
- **🖼 Galería tipo Google Photos** — grid virtualizado que mantiene ~28 nodos en el DOM
  aunque tengas 50,000 objetos.
- **⚡ Búsqueda instantánea (⌘K)** — índice full-text en un Web Worker: 50k objetos indexados
  en ~730 ms, búsquedas de 7–94 ms, con prefijos y tolerancia a errores de dedo.
- **🛂 Pasaporte Digital** — cada objeto es su historial completo: línea de tiempo de eventos,
  préstamos ("¿quién tiene mi taladro?"), mantenimientos con costo, facturas y manuales PDF
  offline, comentarios y ficha imprimible.
- **🗺 Mapa Inteligente** — dibuja el plano de tu casa (piezas arrastrables y redimensionables),
  toca una habitación y ve sus objetos, con valor total por habitación y vista 3D.
- **📊 Panel** — valor del inventario, garantías por vencer, distribución por habitación y
  categoría con gráficas clickeables.
- **🔔 Recordatorios** — garantías y devoluciones, con campana en la app y notificaciones del
  sistema.
- **💾 Respaldo total** — un JSON con todo (fotos y PDFs incluidos) para migrar de dispositivo;
  export CSV para Excel. Importación validada y transaccional.
- **🌗 Aura Design System** — tokens oklch, tema claro/oscuro/sistema, glassmorphism ligero,
  microanimaciones (showcase interno en `/design`).

## Arquitectura

Clean Architecture pragmática con reglas de capas **forzadas por ESLint**
(`import/no-restricted-paths`):

```
domain/        entidades zod (schema = validación + tipos), reglas puras, interfaces de repos
data/          Dexie (IndexedDB), repositorios concretos, índice de búsqueda en worker
application/   servicios (casos de uso), composition root, hooks TanStack Query
design-system/ tokens + primitivas Radix (futuro @aura/ui — no conoce el dominio)
features/      vertical slices: inventory, passport, map, search, dashboard…
pages/         composición por ruta (code splitting)
```

Decisiones clave:

- **Local-first**: IndexedDB es la fuente de verdad; la UI consume repositorios vía interfaces,
  así que una futura capa cloud (Supabase) se enchufa sin tocar la UI. IDs UUID v4 de cliente
  desde el día 1.
- **La línea de tiempo es gratis**: los servicios escriben `ItemEvent` en cada mutación
  relevante — el Pasaporte Digital se alimenta solo.
- **Blobs separados de metadatos**: listar 50k objetos jamás deserializa una imagen.
- **Borrar catálogos nunca borra objetos**: limpia referencias, transaccionalmente.

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run verify     # lint (reglas de capas) + formato + 52 tests + build
npm run deploy     # verify + publica dist/ a gh-pages
```

Utilidades de consola en dev: `__aura.seedDemo()` y `__aura.seedBulk(50000)` (benchmark).

## Roadmap

v1.0 cubre las Fases 1–4 del [roadmap](docs/ROADMAP.md). Post-1.0: i18n en, sincronización en
la nube (patrón outbox), compartir inventarios, OCR de facturas, escáner de códigos.
Diseño completo en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y
[docs/DATA_MODEL.md](docs/DATA_MODEL.md).

---

<div align="center">

Primer producto del ecosistema **Aura** · hermano de
[Aura Music](https://github.com/mamueljr/Aura-music)

Hecho con ♥ por [@mamueljr](https://github.com/mamueljr)

</div>
