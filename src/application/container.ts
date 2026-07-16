import { db, type AuraDatabase } from '@/data/db/AuraDatabase'
import {
  DexieAttachmentRepository,
  DexieCrudRepository,
  DexieItemEventRepository,
  DexieItemRepository,
  DexieLoanRepository,
  DexiePhotoRepository,
  DexieReminderRepository,
  DexieUnitOfWork,
} from '@/data/repositories/dexie-repositories'
import { ItemService } from '@/application/services/item-service'

/**
 * Composition root: único lugar donde application conoce las implementaciones
 * concretas. Exporta un contenedor por base de datos (la app usa el singleton;
 * los tests construyen el suyo con una BD efímera).
 */
export function createContainer(database: AuraDatabase) {
  const repos = {
    items: new DexieItemRepository(database.items),
    photos: new DexiePhotoRepository(database.photos),
    attachments: new DexieAttachmentRepository(database.attachments),
    events: new DexieItemEventRepository(database.itemEvents),
    loans: new DexieLoanRepository(database.loans),
    reminders: new DexieReminderRepository(database.reminders),
    categories: new DexieCrudRepository(database.categories),
    rooms: new DexieCrudRepository(database.rooms),
    locations: new DexieCrudRepository(database.locations),
    tags: new DexieCrudRepository(database.tags),
    collections: new DexieCrudRepository(database.collections),
  }
  const uow = new DexieUnitOfWork(database)
  const itemService = new ItemService({ uow, ...repos })
  return { repos, uow, itemService }
}

export type Container = ReturnType<typeof createContainer>

export const container = createContainer(db)
