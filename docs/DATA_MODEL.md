# Aura Inventory — Modelo de datos (v1, propuesta)

> Se implementa en v0.3. IDs: UUID v4 generados en cliente (preparados para sync).
> Todas las entidades llevan `createdAt` / `updatedAt` (ISO 8601) y `deletedAt`
> opcional (soft delete → papelera y sync futura).

## Item (núcleo)

```ts
interface Item {
  id: string
  name: string
  description?: string
  categoryId?: string
  subcategoryId?: string
  brand?: string
  model?: string
  color?: string
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor' | 'broken'
  serialNumber?: string
  quantity: number // default 1
  purchasePrice?: number
  currency?: string // ISO 4217, default de preferencias
  currentValue?: number
  purchaseDate?: string
  purchasePlace?: string
  supplier?: string
  warrantyUntil?: string
  roomId?: string
  locationId?: string // ubicación fina dentro de la habitación
  notes?: string
  tagIds: string[] // índice multiEntry
  collectionIds: string[]
  qrCode?: string
  barcode?: string
  coverPhotoId?: string
  favorite: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}
```

## Media

```ts
interface Photo {
  id: string
  itemId: string
  order: number
  blob: Blob // WebP ~1600px
  thumbBlob: Blob // WebP ~320px
  width: number
  height: number
  createdAt: string
}

interface Attachment {
  id: string
  itemId: string
  kind: 'invoice' | 'manual' | 'other'
  name: string
  mimeType: string
  blob: Blob
  size: number
  createdAt: string
}
```

## Organización

```ts
interface Category {
  id
  name
  icon
  color
  parentId?: string
} // parentId → subcategoría
interface Room {
  id
  name
  icon
  color
  order
  mapShape?: MapShape
} // MapShape: v0.9
interface Location {
  id
  roomId
  name
} // "cajón 2", "estante A"
interface Tag {
  id
  name
  color
}
interface Collection {
  id
  name
  description?
  coverPhotoId?
}
```

## Línea de tiempo (motor del Pasaporte Digital)

```ts
interface ItemEvent {
  id: string
  itemId: string
  type:
    | 'created'
    | 'purchased'
    | 'moved'
    | 'maintenance'
    | 'loaned'
    | 'returned'
    | 'value-updated'
    | 'comment'
    | 'custom'
  date: string
  title: string
  detail?: string
  payload?: Record<string, unknown> // p.ej. { fromRoomId, toRoomId } en 'moved'
  cost?: number // mantenimientos
}

interface Loan {
  id: string
  itemId: string
  borrowerName: string
  borrowerContact?: string
  loanedAt: string
  dueAt?: string
  returnedAt?: string
}

interface Reminder {
  id: string
  itemId?: string
  type: 'warranty' | 'maintenance' | 'expiry' | 'review' | 'loan-due' | 'custom'
  dueAt: string
  title: string
  done: boolean
  notifiedAt?: string
}
```

## Reglas de negocio clave

- Mover un item de habitación ⇒ el servicio escribe el `ItemEvent('moved')`; la UI nunca crea eventos a mano.
- Prestar ⇒ crea `Loan` + `ItemEvent('loaned')`; devolver cierra el Loan + `ItemEvent('returned')`.
- Borrar item ⇒ soft delete; fotos/adjuntos se purgan al vaciar papelera (acción explícita del usuario).
- `warrantyUntil` y `Loan.dueAt` generan `Reminder`s automáticamente.

## Índices Dexie (v1)

```
items:        id, categoryId, roomId, updatedAt, *tagIds, *collectionIds
photos:       id, itemId
attachments:  id, itemId
itemEvents:   id, itemId, date, type
loans:        id, itemId, returnedAt
reminders:    id, itemId, dueAt
categories/rooms/locations/tags/collections: id (+ parentId / roomId donde aplica)
```

Nota: IndexedDB no indexa booleanos — `favorite` y `done` se filtran en memoria
(sobre resultados ya acotados por índice); si algún día pesa, se migra a 0/1.

Los blobs viven solo en `photos`/`attachments`: listar items jamás carga imágenes.
