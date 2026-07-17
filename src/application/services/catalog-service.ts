import type { Category, Collection, Location, Room, Tag } from '@/domain/entities'
import { findFreeSpot } from '@/domain/map-placement'
import type {
  CategoryRepository,
  CollectionRepository,
  ItemRepository,
  LocationRepository,
  RoomRepository,
  TagRepository,
  UnitOfWork,
} from '@/domain/repositories'
import { newId, nowIso } from '@/utils/ids'

interface CatalogServiceDeps {
  uow: UnitOfWork
  items: ItemRepository
  rooms: RoomRepository
  locations: LocationRepository
  categories: CategoryRepository
  tags: TagRepository
  collections: CollectionRepository
}

/**
 * CRUD de catálogos (habitaciones, ubicaciones, categorías, etiquetas,
 * colecciones). Regla central: borrar un catálogo nunca borra objetos —
 * limpia sus referencias para que el inventario quede consistente.
 */
export class CatalogService {
  private readonly deps: CatalogServiceDeps

  constructor(deps: CatalogServiceDeps) {
    this.deps = deps
  }

  // ── Habitaciones ────────────────────────────────────────────────
  async createRoom(name: string, icon?: string): Promise<Room> {
    const rooms = await this.deps.rooms.getAll()
    const room: Room = {
      id: newId(),
      name: name.trim(),
      icon,
      order: rooms.length ? Math.max(...rooms.map((r) => r.order)) + 1 : 0,
    }
    await this.deps.rooms.put(room)
    return room
  }

  async renameRoom(id: string, name: string): Promise<void> {
    const room = await this.mustGet(this.deps.rooms, id, 'habitación')
    await this.deps.rooms.put({ ...room, name: name.trim() })
  }

  async deleteRoom(id: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const affected = await this.deps.items.listByRoom(id)
      for (const item of affected) {
        await this.deps.items.put({
          ...item,
          roomId: undefined,
          locationId: undefined,
          updatedAt: nowIso(),
        })
      }
      const locations = (await this.deps.locations.getAll()).filter((l) => l.roomId === id)
      for (const loc of locations) await this.deps.locations.delete(loc.id)
      await this.deps.rooms.delete(id)
    })
  }

  /** Posición/tamaño de la habitación en el Mapa Inteligente (undefined = fuera del plano). */
  async setRoomShape(id: string, mapShape: Room['mapShape']): Promise<void> {
    const room = await this.mustGet(this.deps.rooms, id, 'habitación')
    await this.deps.rooms.put({ ...room, mapShape })
  }

  /**
   * Coloca la habitación en el primer hueco libre del plano. El hueco se
   * calcula aquí con datos frescos (calcularlo en la UI usa estado stale y
   * dos colocaciones rápidas terminan traslapadas).
   */
  async placeRoomOnMap(id: string): Promise<void> {
    const room = await this.mustGet(this.deps.rooms, id, 'habitación')
    const others = (await this.deps.rooms.getAll())
      .filter((r) => r.id !== id && r.mapShape)
      .map((r) => r.mapShape!)
    await this.deps.rooms.put({ ...room, mapShape: findFreeSpot(others) })
  }

  // ── Ubicaciones ─────────────────────────────────────────────────
  async createLocation(roomId: string, name: string): Promise<Location> {
    await this.mustGet(this.deps.rooms, roomId, 'habitación')
    const location: Location = { id: newId(), roomId, name: name.trim() }
    await this.deps.locations.put(location)
    return location
  }

  async deleteLocation(id: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const affected = (await this.deps.items.getAll()).filter((i) => i.locationId === id)
      for (const item of affected) {
        await this.deps.items.put({ ...item, locationId: undefined, updatedAt: nowIso() })
      }
      await this.deps.locations.delete(id)
    })
  }

  // ── Categorías ──────────────────────────────────────────────────
  async createCategory(name: string, parentId?: string): Promise<Category> {
    if (parentId) await this.mustGet(this.deps.categories, parentId, 'categoría')
    const category: Category = { id: newId(), name: name.trim(), parentId }
    await this.deps.categories.put(category)
    return category
  }

  async renameCategory(id: string, name: string): Promise<void> {
    const category = await this.mustGet(this.deps.categories, id, 'categoría')
    await this.deps.categories.put({ ...category, name: name.trim() })
  }

  /** Borra la categoría y sus subcategorías; limpia referencias en items. */
  async deleteCategory(id: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const all = await this.deps.categories.getAll()
      const toDelete = new Set([id, ...all.filter((c) => c.parentId === id).map((c) => c.id)])

      const affected = (await this.deps.items.getAll()).filter(
        (i) =>
          (i.categoryId && toDelete.has(i.categoryId)) ||
          (i.subcategoryId && toDelete.has(i.subcategoryId)),
      )
      for (const item of affected) {
        await this.deps.items.put({
          ...item,
          categoryId:
            item.categoryId && toDelete.has(item.categoryId) ? undefined : item.categoryId,
          subcategoryId:
            item.subcategoryId && toDelete.has(item.subcategoryId) ? undefined : item.subcategoryId,
          updatedAt: nowIso(),
        })
      }
      for (const catId of toDelete) await this.deps.categories.delete(catId)
    })
  }

  // ── Etiquetas ───────────────────────────────────────────────────
  async createTag(name: string, color?: string): Promise<Tag> {
    const tag: Tag = { id: newId(), name: name.trim(), color }
    await this.deps.tags.put(tag)
    return tag
  }

  async deleteTag(id: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const affected = await this.deps.items.listByTag(id)
      for (const item of affected) {
        await this.deps.items.put({
          ...item,
          tagIds: item.tagIds.filter((t) => t !== id),
          updatedAt: nowIso(),
        })
      }
      await this.deps.tags.delete(id)
    })
  }

  // ── Colecciones ─────────────────────────────────────────────────
  async createCollection(name: string, description?: string): Promise<Collection> {
    const collection: Collection = { id: newId(), name: name.trim(), description }
    await this.deps.collections.put(collection)
    return collection
  }

  async deleteCollection(id: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const affected = await this.deps.items.listByCollection(id)
      for (const item of affected) {
        await this.deps.items.put({
          ...item,
          collectionIds: item.collectionIds.filter((c) => c !== id),
          updatedAt: nowIso(),
        })
      }
      await this.deps.collections.delete(id)
    })
  }

  private async mustGet<T extends { id: string }>(
    repo: { getById(id: string): Promise<T | undefined> },
    id: string,
    kind: string,
  ): Promise<T> {
    const entity = await repo.getById(id)
    if (!entity) throw new Error(`No existe la ${kind} ${id}`)
    return entity
  }
}
