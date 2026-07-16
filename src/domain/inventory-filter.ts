import type { Item } from '@/domain/entities'

/** Filtro combinable del inventario. Cada eje ausente = sin restricción. */
export interface InventoryFilter {
  roomId?: string
  /** Coincide contra categoría o subcategoría del item. */
  categoryId?: string
  tagId?: string
  collectionId?: string
  favoritesOnly?: boolean
}

export function matchesFilter(item: Item, f: InventoryFilter): boolean {
  if (f.favoritesOnly && !item.favorite) return false
  if (f.roomId && item.roomId !== f.roomId) return false
  if (f.categoryId && item.categoryId !== f.categoryId && item.subcategoryId !== f.categoryId)
    return false
  if (f.tagId && !item.tagIds.includes(f.tagId)) return false
  if (f.collectionId && !item.collectionIds.includes(f.collectionId)) return false
  return true
}

export function isFilterActive(f: InventoryFilter): boolean {
  return !!(f.roomId || f.categoryId || f.tagId || f.collectionId || f.favoritesOnly)
}
