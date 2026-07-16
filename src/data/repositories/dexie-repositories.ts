import type { EntityTable, IDType } from 'dexie'
import type { AuraDatabase } from '@/data/db/AuraDatabase'
import type { Attachment, Item, ItemEvent, Loan, Photo, Reminder } from '@/domain/entities'
import type {
  AttachmentRepository,
  CrudRepository,
  ItemEventRepository,
  ItemRepository,
  LoanRepository,
  PhotoRepository,
  ReminderRepository,
  UnitOfWork,
} from '@/domain/repositories'

export class DexieCrudRepository<T extends { id: string }> implements CrudRepository<T> {
  protected readonly table: EntityTable<T, 'id'>

  constructor(table: EntityTable<T, 'id'>) {
    this.table = table
  }

  getById(id: string) {
    // IDType<T,'id'> es string para todo T del dominio; el genérico no lo resuelve solo
    return this.table.get(id as IDType<T, 'id'>)
  }

  getAll() {
    return this.table.toArray()
  }

  async put(entity: T) {
    await this.table.put(entity)
  }

  async bulkPut(entities: T[]) {
    await this.table.bulkPut(entities)
  }

  async delete(id: string) {
    await this.table.delete(id as IDType<T, 'id'>)
  }
}

const isActive = (item: Item) => item.deletedAt === undefined

export class DexieItemRepository extends DexieCrudRepository<Item> implements ItemRepository {
  listRecent(limit = 50) {
    return this.table.orderBy('updatedAt').reverse().filter(isActive).limit(limit).toArray()
  }

  listByRoom(roomId: string) {
    return this.table.where('roomId').equals(roomId).filter(isActive).toArray()
  }

  listByCategory(categoryId: string) {
    return this.table.where('categoryId').equals(categoryId).filter(isActive).toArray()
  }

  listByTag(tagId: string) {
    return this.table.where('tagIds').equals(tagId).filter(isActive).toArray()
  }

  listByCollection(collectionId: string) {
    return this.table.where('collectionIds').equals(collectionId).filter(isActive).toArray()
  }

  listFavorites() {
    return this.table.filter((i) => isActive(i) && i.favorite).toArray()
  }

  listDeleted() {
    return this.table.filter((i) => i.deletedAt !== undefined).toArray()
  }

  countActive() {
    return this.table.filter(isActive).count()
  }
}

export class DexiePhotoRepository extends DexieCrudRepository<Photo> implements PhotoRepository {
  async listByItem(itemId: string) {
    const photos = await this.table.where('itemId').equals(itemId).toArray()
    return photos.sort((a, b) => a.order - b.order)
  }

  async deleteByItem(itemId: string) {
    await this.table.where('itemId').equals(itemId).delete()
  }
}

export class DexieAttachmentRepository
  extends DexieCrudRepository<Attachment>
  implements AttachmentRepository
{
  listByItem(itemId: string) {
    return this.table.where('itemId').equals(itemId).toArray()
  }

  async deleteByItem(itemId: string) {
    await this.table.where('itemId').equals(itemId).delete()
  }
}

export class DexieItemEventRepository
  extends DexieCrudRepository<ItemEvent>
  implements ItemEventRepository
{
  async listByItem(itemId: string) {
    const events = await this.table.where('itemId').equals(itemId).sortBy('date')
    return events.reverse()
  }

  async deleteByItem(itemId: string) {
    await this.table.where('itemId').equals(itemId).delete()
  }
}

export class DexieLoanRepository extends DexieCrudRepository<Loan> implements LoanRepository {
  getActiveByItem(itemId: string) {
    return this.table
      .where('itemId')
      .equals(itemId)
      .filter((l) => l.returnedAt === undefined)
      .first()
  }

  listActive() {
    return this.table.filter((l) => l.returnedAt === undefined).toArray()
  }

  async deleteByItem(itemId: string) {
    await this.table.where('itemId').equals(itemId).delete()
  }
}

export class DexieReminderRepository
  extends DexieCrudRepository<Reminder>
  implements ReminderRepository
{
  listPending(untilIso: string) {
    return this.table
      .where('dueAt')
      .belowOrEqual(untilIso)
      .filter((r) => !r.done)
      .toArray()
  }

  listByItem(itemId: string) {
    return this.table.where('itemId').equals(itemId).toArray()
  }

  async deleteByItem(itemId: string) {
    await this.table.where('itemId').equals(itemId).delete()
  }
}

/** Transacción de escritura sobre todas las tablas del inventario. */
export class DexieUnitOfWork implements UnitOfWork {
  private readonly db: AuraDatabase

  constructor(db: AuraDatabase) {
    this.db = db
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.db.transaction('rw', this.db.tables, work)
  }
}
