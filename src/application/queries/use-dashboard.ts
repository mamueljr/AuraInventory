import { useQuery } from '@tanstack/react-query'
import type { Item } from '@/domain/entities'
import { container } from '@/application/container'

export interface DistributionRow {
  id: string
  name: string
  count: number
  value: number
}

export interface DashboardStats {
  itemCount: number
  totalValue: number
  favoriteCount: number
  photoCount: number
  /** Garantías que vencen en los próximos 90 días, ordenadas por fecha. */
  expiringWarranties: { item: Item; daysLeft: number }[]
  byRoom: DistributionRow[]
  byCategory: DistributionRow[]
  recent: Item[]
}

const itemValue = (i: Item) => (i.currentValue ?? i.purchasePrice ?? 0) * i.quantity

function distribution(
  items: Item[],
  key: (i: Item) => string | undefined,
  names: Map<string, string>,
  fallback: string,
): DistributionRow[] {
  const rows = new Map<string, DistributionRow>()
  for (const item of items) {
    const id = key(item) ?? '__none__'
    const row = rows.get(id) ?? {
      id,
      name: id === '__none__' ? fallback : (names.get(id) ?? '—'),
      count: 0,
      value: 0,
    }
    row.count += 1
    row.value += itemValue(item)
    rows.set(id, row)
  }
  return [...rows.values()].sort((a, b) => b.count - a.count)
}

export async function computeStats(repos = container.repos): Promise<DashboardStats> {
  const [all, rooms, categories, photos] = await Promise.all([
    repos.items.getAll(),
    repos.rooms.getAll(),
    repos.categories.getAll(),
    repos.photos.getAll(),
  ])
  const items = all.filter((i) => !i.deletedAt)
  const roomNames = new Map(rooms.map((r) => [r.id, r.name]))
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]))

  const now = Date.now()
  const HORIZON_DAYS = 90
  const expiringWarranties = items
    .filter((i) => i.warrantyUntil)
    .map((item) => ({
      item,
      daysLeft: Math.ceil((new Date(item.warrantyUntil!).getTime() - now) / 86_400_000),
    }))
    .filter(({ daysLeft }) => daysLeft >= 0 && daysLeft <= HORIZON_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return {
    itemCount: items.length,
    totalValue: items.reduce((sum, i) => sum + itemValue(i), 0),
    favoriteCount: items.filter((i) => i.favorite).length,
    photoCount: photos.length,
    expiringWarranties,
    byRoom: distribution(items, (i) => i.roomId, roomNames, 'Sin habitación'),
    byCategory: distribution(items, (i) => i.categoryId, categoryNames, 'Sin categoría'),
    recent: [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
  }
}

export function useDashboardStats() {
  // clave bajo 'items' para que las mutaciones de objetos lo invaliden
  return useQuery({ queryKey: ['items', 'dashboard'], queryFn: () => computeStats() })
}
