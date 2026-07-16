import { useSearchParams } from 'react-router-dom'
import type { InventoryFilter } from '@/domain/inventory-filter'

export const FILTER_KEYS = ['room', 'category', 'tag', 'collection', 'fav'] as const

/** Lee el filtro desde la URL (compartible y persistente en navegación). */
export function useInventoryFilter(): [InventoryFilter, (patch: Record<string, string>) => void] {
  const [params, setParams] = useSearchParams()
  const filter: InventoryFilter = {
    roomId: params.get('room') ?? undefined,
    categoryId: params.get('category') ?? undefined,
    tagId: params.get('tag') ?? undefined,
    collectionId: params.get('collection') ?? undefined,
    favoritesOnly: params.get('fav') === '1',
  }
  const update = (patch: Record<string, string>) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }
  return [filter, update]
}
