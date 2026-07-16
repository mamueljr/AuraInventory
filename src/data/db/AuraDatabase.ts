import Dexie, { type EntityTable } from 'dexie'
import type {
  Attachment,
  Category,
  Collection,
  Item,
  ItemEvent,
  Loan,
  Location,
  Photo,
  Reminder,
  Room,
  Tag,
} from '@/domain/entities'

/**
 * Esquema IndexedDB v1. Reglas:
 * - Los blobs viven SOLO en photos/attachments: listar items nunca carga imágenes.
 * - `favorite` no se indexa (IndexedDB no indexa booleanos); se filtra en memoria.
 * - Migraciones: nueva versión = this.version(n+1).stores({...}).upgrade(...);
 *   nunca editar una versión ya publicada.
 */
export class AuraDatabase extends Dexie {
  items!: EntityTable<Item, 'id'>
  photos!: EntityTable<Photo, 'id'>
  attachments!: EntityTable<Attachment, 'id'>
  itemEvents!: EntityTable<ItemEvent, 'id'>
  loans!: EntityTable<Loan, 'id'>
  reminders!: EntityTable<Reminder, 'id'>
  categories!: EntityTable<Category, 'id'>
  rooms!: EntityTable<Room, 'id'>
  locations!: EntityTable<Location, 'id'>
  tags!: EntityTable<Tag, 'id'>
  collections!: EntityTable<Collection, 'id'>

  constructor(name = 'aura-inventory') {
    super(name)
    this.version(1).stores({
      items: 'id, categoryId, roomId, updatedAt, *tagIds, *collectionIds',
      photos: 'id, itemId',
      attachments: 'id, itemId',
      itemEvents: 'id, itemId, date, type',
      loans: 'id, itemId, returnedAt',
      reminders: 'id, itemId, dueAt',
      categories: 'id, parentId',
      rooms: 'id, order',
      locations: 'id, roomId',
      tags: 'id',
      collections: 'id',
    })
  }
}

/** Instancia única de la app. Los tests crean la suya con un nombre aleatorio. */
export const db = new AuraDatabase()
