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
import { CatalogService } from '@/application/services/catalog-service'
import { ItemService } from '@/application/services/item-service'
import { PhotoService } from '@/application/services/photo-service'
import { SearchService } from '@/application/services/search-service'

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
  const photoService = new PhotoService({ uow, items: repos.items, photos: repos.photos })
  const catalogService = new CatalogService({ uow, ...repos })
  const searchService = new SearchService(repos)
  searchService.attachDirtyTracking(database)
  return { repos, uow, itemService, photoService, catalogService, searchService }
}

export type Container = ReturnType<typeof createContainer>

export const container = createContainer(db)
