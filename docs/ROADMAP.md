# Aura Inventory — Roadmap

> Regla: cada versión termina **funcional, desplegable y demostrable**.
> No se abre la siguiente versión sin cerrar la anterior (build verde + demo en Pages).

## Fase 1 — Fundación

### v0.1 · Fundación del proyecto

Vite + React + TS strict, Tailwind v4, ESLint (reglas de capas) + Prettier, Vitest,
estructura de carpetas de ARCHITECTURE.md, React Router con truco 404 para Pages,
script `verify` (typecheck+lint+test+build), deploy manual a `gh-pages` funcionando.
**Demo:** app "Hola Aura" instalable-no, pero desplegada en Pages.

### v0.2 · Aura Design System (ADS)

Tokens (color, tipografía, espaciado, radios, sombras, blur) como CSS variables;
tema claro/oscuro con persistencia y `prefers-color-scheme`; primitivas shadcn-style
(Button, Input, Card, Dialog, Sheet, Dropdown, Toast, Badge, Skeleton, Tabs);
glassmorphism ligero; página `/design` que muestra todo el sistema (showcase interno).
**Demo:** galería del design system navegable en ambos temas.

### v0.3 · Modelo de datos y capa de persistencia

Entidades en `domain/` con zod; esquema Dexie v1 + estrategia de migraciones;
repositorios (Item, Photo, Room, Category, Tag, Collection, Event) con unit tests;
hooks de TanStack Query; seed de datos demo para desarrollo.
**Demo:** sin UI nueva — suite de tests verde que ejercita todo el CRUD.

## Fase 2 — Producto mínimo adorable

### v0.4 · Registro y galería de objetos

Alta/edición/borrado de objetos con formulario por pasos (no un formulario-muro);
captura y selección de fotos con compresión + thumbnails; grid visual tipo
Google Photos (virtualizado desde el día 1); vista de detalle básica; favoritos.
**Demo:** registrar 20 objetos reales con fotos, navegar el grid con fluidez.

### v0.5 · Organización

Categorías/subcategorías (catálogo inicial + personalizadas), habitaciones,
ubicaciones, etiquetas, colecciones; filtros combinables en el grid; navegación
por habitación/categoría.
**Demo:** el mismo inventario, ahora navegable por cualquier eje.

### v0.6 · Búsqueda instantánea

Índice full-text en Web Worker (nombre, marca, modelo, serie, notas, etiquetas,
ubicación); barra de búsqueda global (⌘K) con resultados al teclear; benchmark
con 50k items sembrados.
**Demo:** buscar sobre 50,000 objetos generados sin jank perceptible.

### v0.7 · Dashboard

Valor total, conteo, objetos recientes, garantías próximas a vencer; gráficas de
distribución por categoría y habitación (siguiendo la skill de dataviz); estados
vacíos cuidados.
**Demo:** pantalla de inicio que da gusto abrir.

## Fase 3 — Diferenciadores

### v0.8 · Pasaporte Digital

Ficha premium del objeto: hero de fotos (fullscreen + zoom), datos de compra/garantía,
facturas y manuales PDF adjuntos, línea de tiempo (`ItemEvent`), historial de
mantenimiento y movimientos, préstamos (quién lo tiene), comentarios.
**Demo:** el pasaporte de una laptop con factura, manual, 2 mantenimientos y un préstamo.

### v0.9 · Mapa Inteligente

Editor sencillo de plano (habitaciones como piezas arrastrables en vista
isométrica/ilustrada 2D); tap en habitación → objetos de esa habitación; contador y
valor por habitación sobre el plano.
**Demo:** plano de una casa con 5 habitaciones y navegación desde el mapa.

### v0.10 · Import / Export y notificaciones

Export JSON (backup completo con fotos), CSV/Excel; import de backup JSON con
validación; base de PDF (ficha de objeto imprimible); recordatorios locales de
garantía/mantenimiento (Notifications API + fallback en app).
**Demo:** exportar todo, borrar la base, restaurar el backup intacto.

## Fase 4 — Release

### v1.0 · PWA pulida y release

vite-plugin-pwa completo (instalable, offline total, splash, iconos adaptativos —
generados con `sharp`, no ImageMagick); auditoría de accesibilidad (ARIA, teclado,
contraste); auditoría de rendimiento (Lighthouse ≥ 90 en todo); i18n es/en completa;
onboarding de primer uso; README con capturas + landing del proyecto.
**Demo:** instalada en un teléfono Android, usada en modo avión.

## Post-1.0 (arquitectura ya preparada, no se implementa antes)

Sincronización en nube (Supabase, patrón outbox), compartir inventarios / modo
familiar, OCR de facturas, reconocimiento de objetos con IA, escáner QR/código de
barras con cámara, estadísticas de patrimonio, apps Android/iOS (TWA primero).

## Riesgos vigilados

- **Cuota de IndexedDB** con muchas fotos → compresión agresiva + medidor de uso (`navigator.storage.estimate`) desde v0.4.
- **GitHub Actions bloqueado** (billing) → deploy manual documentado desde v0.1.
- **Scope creep** → los diferenciadores (v0.8/v0.9) no empiezan hasta que v0.4–v0.7 estén cerradas.
