import { useQuery } from '@tanstack/react-query'
import { container } from '@/application/container'
import { queryKeys } from '@/application/queries/keys'

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: async () =>
      (await container.repos.collections.getAll()).sort((a, b) => a.name.localeCompare(b.name)),
  })
}
