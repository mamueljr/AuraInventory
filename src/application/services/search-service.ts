import type { AuraDatabase } from '@/data/db/AuraDatabase'
import { buildSearchDocs } from '@/data/search/build-docs'
import { SearchWorkerClient, type BuildStats, type SearchResult } from '@/data/search/search-client'
import type {
  CategoryRepository,
  ItemRepository,
  LocationRepository,
  RoomRepository,
  TagRepository,
} from '@/domain/repositories'

interface SearchServiceDeps {
  items: ItemRepository
  rooms: RoomRepository
  locations: LocationRepository
  categories: CategoryRepository
  tags: TagRepository
}

/**
 * Búsqueda instantánea. El índice vive en un Web Worker y se (re)construye
 * perezosamente: cualquier escritura en las tablas relevantes lo marca sucio
 * y la siguiente búsqueda lo reconstruye. Reconstruir 50k docs ≈ 1s en el
 * worker, sin bloquear la UI.
 */
export class SearchService {
  private readonly deps: SearchServiceDeps
  private readonly client = new SearchWorkerClient()
  private dirty = true
  private building: Promise<BuildStats> | null = null
  /** Estadísticas del último build (para el benchmark y la UI). */
  lastBuild: BuildStats | null = null

  constructor(deps: SearchServiceDeps) {
    this.deps = deps
  }

  /** Marca el índice como obsoleto ante cualquier escritura relevante. */
  attachDirtyTracking(db: AuraDatabase): void {
    const tables = [db.items, db.rooms, db.locations, db.categories, db.tags]
    for (const table of tables) {
      table.hook('creating', () => {
        this.dirty = true
      })
      table.hook('updating', () => {
        this.dirty = true
      })
      table.hook('deleting', () => {
        this.dirty = true
      })
    }
  }

  async ensureReady(): Promise<BuildStats> {
    if (!this.dirty && this.lastBuild) return this.lastBuild
    this.building ??= this.build()
    try {
      return await this.building
    } finally {
      this.building = null
    }
  }

  async search(query: string, limit = 12): Promise<SearchResult> {
    await this.ensureReady()
    return this.client.search(query, limit)
  }

  private async build(): Promise<BuildStats> {
    const [items, rooms, locations, categories, tags] = await Promise.all([
      this.deps.items.getAll(),
      this.deps.rooms.getAll(),
      this.deps.locations.getAll(),
      this.deps.categories.getAll(),
      this.deps.tags.getAll(),
    ])
    this.dirty = false
    const docs = buildSearchDocs(items, rooms, locations, categories, tags)
    this.lastBuild = await this.client.build(docs)
    return this.lastBuild
  }
}
