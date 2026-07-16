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
 * Contratos de persistencia. La UI nunca los usa directamente:
 * los consume `application` (servicios y hooks de queries).
 * La implementación actual es Dexie; una futura capa cloud
 * implementa estas mismas interfaces sin tocar nada más.
 */
export interface CrudRepository<T extends { id: string }> {
  getById(id: string): Promise<T | undefined>
  getAll(): Promise<T[]>
  put(entity: T): Promise<void>
  bulkPut(entities: T[]): Promise<void>
  delete(id: string): Promise<void>
}

export interface ItemRepository extends CrudRepository<Item> {
  /** Activos (sin soft delete), del más reciente al más antiguo. */
  listRecent(limit?: number): Promise<Item[]>
  listByRoom(roomId: string): Promise<Item[]>
  listByCategory(categoryId: string): Promise<Item[]>
  listByTag(tagId: string): Promise<Item[]>
  listByCollection(collectionId: string): Promise<Item[]>
  listFavorites(): Promise<Item[]>
  /** Papelera: solo los soft-deleted. */
  listDeleted(): Promise<Item[]>
  countActive(): Promise<number>
}

export interface PhotoRepository extends CrudRepository<Photo> {
  listByItem(itemId: string): Promise<Photo[]>
  deleteByItem(itemId: string): Promise<void>
}

export interface AttachmentRepository extends CrudRepository<Attachment> {
  listByItem(itemId: string): Promise<Attachment[]>
  deleteByItem(itemId: string): Promise<void>
}

export interface ItemEventRepository extends CrudRepository<ItemEvent> {
  /** Línea de tiempo del objeto, más reciente primero. */
  listByItem(itemId: string): Promise<ItemEvent[]>
  deleteByItem(itemId: string): Promise<void>
}

export interface LoanRepository extends CrudRepository<Loan> {
  getActiveByItem(itemId: string): Promise<Loan | undefined>
  listActive(): Promise<Loan[]>
  deleteByItem(itemId: string): Promise<void>
}

export interface ReminderRepository extends CrudRepository<Reminder> {
  /** Pendientes con vencimiento hasta la fecha dada (ISO). */
  listPending(untilIso: string): Promise<Reminder[]>
  listByItem(itemId: string): Promise<Reminder[]>
  deleteByItem(itemId: string): Promise<void>
}

export type CategoryRepository = CrudRepository<Category>
export type RoomRepository = CrudRepository<Room>
export type LocationRepository = CrudRepository<Location>
export type TagRepository = CrudRepository<Tag>
export type CollectionRepository = CrudRepository<Collection>

/** Ejecuta trabajo dentro de una transacción de escritura sobre todo el inventario. */
export interface UnitOfWork {
  run<T>(work: () => Promise<T>): Promise<T>
}
