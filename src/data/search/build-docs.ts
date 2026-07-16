import type { Category, Item, Location, Room, Tag } from '@/domain/entities'
import type { SearchDoc } from './index-core'

/** Denormaliza items + catálogos en documentos indexables. Excluye la papelera. */
export function buildSearchDocs(
  items: Item[],
  rooms: Room[],
  locations: Location[],
  categories: Category[],
  tags: Tag[],
): SearchDoc[] {
  const roomName = new Map(rooms.map((r) => [r.id, r.name]))
  const locationName = new Map(locations.map((l) => [l.id, l.name]))
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const tagName = new Map(tags.map((t) => [t.id, t.name]))

  return items
    .filter((i) => !i.deletedAt)
    .map((i) => ({
      id: i.id,
      name: i.name,
      brand: i.brand,
      model: i.model,
      serialNumber: i.serialNumber,
      description: i.description,
      notes: i.notes,
      tagNames:
        i.tagIds
          .map((t) => tagName.get(t))
          .filter(Boolean)
          .join(' ') || undefined,
      roomName: i.roomId ? roomName.get(i.roomId) : undefined,
      locationName: i.locationId ? locationName.get(i.locationId) : undefined,
      categoryName:
        [
          i.categoryId ? categoryName.get(i.categoryId) : undefined,
          i.subcategoryId ? categoryName.get(i.subcategoryId) : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
    }))
}
