import { z } from 'zod'
import {
  attachmentSchema,
  categorySchema,
  collectionSchema,
  itemEventSchema,
  itemSchema,
  loanSchema,
  locationSchema,
  photoSchema,
  reminderSchema,
  roomSchema,
  type Item,
} from '@/domain/entities'
import type { AuraDatabase } from '@/data/db/AuraDatabase'

const BACKUP_SCHEMA_VERSION = 1

// ── blobs ⇄ base64 ────────────────────────────────────────────────
const encodedBlobSchema = z.object({ mime: z.string(), data: z.string() })
type EncodedBlob = z.infer<typeof encodedBlobSchema>

async function encodeBlob(blob: Blob): Promise<EncodedBlob> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return { mime: blob.type, data: btoa(binary) }
}

function decodeBlob({ mime, data }: EncodedBlob): Blob {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

// ── esquema del archivo de backup ─────────────────────────────────
const blobFields = { blob: encodedBlobSchema, thumbBlob: encodedBlobSchema }
const backupSchema = z.object({
  app: z.literal('aura-inventory'),
  schema: z.literal(BACKUP_SCHEMA_VERSION),
  exportedAt: z.string(),
  data: z.object({
    items: z.array(itemSchema),
    rooms: z.array(roomSchema),
    locations: z.array(locationSchema),
    categories: z.array(categorySchema),
    tags: z.array(z.object({ id: z.string(), name: z.string(), color: z.string().optional() })),
    collections: z.array(collectionSchema),
    itemEvents: z.array(itemEventSchema),
    loans: z.array(loanSchema),
    reminders: z.array(reminderSchema),
    photos: z.array(photoSchema.omit({ blob: true, thumbBlob: true }).extend(blobFields)),
    attachments: z.array(attachmentSchema.omit({ blob: true }).extend({ blob: encodedBlobSchema })),
  }),
})

export interface ImportResult {
  items: number
  photos: number
  attachments: number
}

/**
 * Copia de seguridad completa: TODO el inventario (fotos y PDFs incluidos,
 * en base64) en un solo JSON. La importación valida con zod y REEMPLAZA la
 * base entera dentro de una transacción — o entra todo, o no entra nada.
 */
export class BackupService {
  private readonly db: AuraDatabase

  constructor(db: AuraDatabase) {
    this.db = db
  }

  async exportBackup(): Promise<Blob> {
    const d = this.db
    const [photos, attachments] = await Promise.all([d.photos.toArray(), d.attachments.toArray()])

    const payload = {
      app: 'aura-inventory' as const,
      schema: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        items: await d.items.toArray(),
        rooms: await d.rooms.toArray(),
        locations: await d.locations.toArray(),
        categories: await d.categories.toArray(),
        tags: await d.tags.toArray(),
        collections: await d.collections.toArray(),
        itemEvents: await d.itemEvents.toArray(),
        loans: await d.loans.toArray(),
        reminders: await d.reminders.toArray(),
        photos: await Promise.all(
          photos.map(async (p) => ({
            ...p,
            blob: await encodeBlob(p.blob),
            thumbBlob: await encodeBlob(p.thumbBlob),
          })),
        ),
        attachments: await Promise.all(
          attachments.map(async (a) => ({ ...a, blob: await encodeBlob(a.blob) })),
        ),
      },
    }
    return new Blob([JSON.stringify(payload)], { type: 'application/json' })
  }

  async importBackup(file: Blob): Promise<ImportResult> {
    let raw: unknown
    try {
      raw = JSON.parse(await file.text())
    } catch {
      throw new Error('El archivo no es un JSON válido')
    }
    const parsed = backupSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error('El archivo no es un respaldo válido de Aura Inventory')
    }
    const { data } = parsed.data

    const photos = data.photos.map((p) => ({
      ...p,
      blob: decodeBlob(p.blob),
      thumbBlob: decodeBlob(p.thumbBlob),
    }))
    const attachments = data.attachments.map((a) => ({ ...a, blob: decodeBlob(a.blob) }))

    const d = this.db
    await d.transaction('rw', d.tables, async () => {
      for (const table of d.tables) await table.clear()
      await d.items.bulkPut(data.items)
      await d.rooms.bulkPut(data.rooms)
      await d.locations.bulkPut(data.locations)
      await d.categories.bulkPut(data.categories)
      await d.tags.bulkPut(data.tags)
      await d.collections.bulkPut(data.collections)
      await d.itemEvents.bulkPut(data.itemEvents)
      await d.loans.bulkPut(data.loans)
      await d.reminders.bulkPut(data.reminders)
      await d.photos.bulkPut(photos)
      await d.attachments.bulkPut(attachments)
    })

    return { items: data.items.length, photos: photos.length, attachments: attachments.length }
  }
}

// ── CSV ───────────────────────────────────────────────────────────
const csvEscape = (value: unknown): string => {
  const s = value === undefined || value === null ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV plano de items con nombres de catálogo resueltos (abre en Excel). */
export function buildItemsCsv(
  items: Item[],
  names: { rooms: Map<string, string>; categories: Map<string, string> },
): string {
  const header = [
    'nombre',
    'marca',
    'modelo',
    'no_serie',
    'cantidad',
    'precio_compra',
    'moneda',
    'valor_actual',
    'fecha_compra',
    'garantia_hasta',
    'habitacion',
    'categoria',
    'favorito',
    'notas',
  ]
  const rows = items.map((i) =>
    [
      i.name,
      i.brand,
      i.model,
      i.serialNumber,
      i.quantity,
      i.purchasePrice,
      i.currency,
      i.currentValue,
      i.purchaseDate,
      i.warrantyUntil,
      i.roomId ? names.rooms.get(i.roomId) : '',
      i.categoryId ? names.categories.get(i.categoryId) : '',
      i.favorite ? 'sí' : 'no',
      i.notes,
    ]
      .map(csvEscape)
      .join(','),
  )
  // BOM para que Excel detecte UTF-8 (acentos)
  return '﻿' + [header.join(','), ...rows].join('\n')
}
