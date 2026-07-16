import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { container } from '@/application/container'

const { repos, catalogService } = container

export function useLocations(roomId?: string) {
  return useQuery({
    queryKey: ['locations', roomId ?? 'all'],
    queryFn: async () => {
      const all = await repos.locations.getAll()
      return (roomId ? all.filter((l) => l.roomId === roomId) : all).sort((a, b) =>
        a.name.localeCompare(b.name),
      )
    },
  })
}

/**
 * Mutaciones de catálogos. Invalida todo: los borrados limpian referencias
 * en items, así que cualquier vista puede quedar afectada.
 */
export function useCatalogMutation<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<unknown>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useCatalogActions() {
  return {
    createRoom: useCatalogMutation((name: string) => catalogService.createRoom(name)),
    renameRoom: useCatalogMutation((id: string, name: string) =>
      catalogService.renameRoom(id, name),
    ),
    deleteRoom: useCatalogMutation((id: string) => catalogService.deleteRoom(id)),
    createLocation: useCatalogMutation((roomId: string, name: string) =>
      catalogService.createLocation(roomId, name),
    ),
    deleteLocation: useCatalogMutation((id: string) => catalogService.deleteLocation(id)),
    createCategory: useCatalogMutation((name: string, parentId?: string) =>
      catalogService.createCategory(name, parentId),
    ),
    renameCategory: useCatalogMutation((id: string, name: string) =>
      catalogService.renameCategory(id, name),
    ),
    deleteCategory: useCatalogMutation((id: string) => catalogService.deleteCategory(id)),
    createTag: useCatalogMutation((name: string) => catalogService.createTag(name)),
    deleteTag: useCatalogMutation((id: string) => catalogService.deleteTag(id)),
    createCollection: useCatalogMutation((name: string) => catalogService.createCollection(name)),
    deleteCollection: useCatalogMutation((id: string) => catalogService.deleteCollection(id)),
  }
}
