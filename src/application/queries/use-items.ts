import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ItemDraft } from '@/domain/entities'
import { container } from '@/application/container'
import { queryKeys } from '@/application/queries/keys'

const { repos, itemService } = container

export function useRecentItems(limit = 50) {
  return useQuery({
    queryKey: queryKeys.items.recent(limit),
    queryFn: () => repos.items.listRecent(limit),
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => repos.items.getById(id),
  })
}

export function useItemCount() {
  return useQuery({
    queryKey: queryKeys.items.count,
    queryFn: () => repos.items.countActive(),
  })
}

export function useItemTimeline(itemId: string) {
  return useQuery({
    queryKey: queryKeys.timeline(itemId),
    queryFn: () => repos.events.listByItem(itemId),
  })
}

/** Invalida todo lo derivado de items tras cualquier mutación. */
function useInvalidateItems() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: queryKeys.items.all })
}

export function useCreateItem() {
  const invalidate = useInvalidateItems()
  return useMutation({
    mutationFn: (draft: ItemDraft) => itemService.create(draft),
    onSuccess: invalidate,
  })
}

export function useUpdateItem() {
  const invalidate = useInvalidateItems()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ItemDraft> }) =>
      itemService.update(id, patch),
    onSuccess: invalidate,
  })
}

export function useDeleteItem() {
  const invalidate = useInvalidateItems()
  return useMutation({
    mutationFn: (id: string) => itemService.softDelete(id),
    onSuccess: invalidate,
  })
}
