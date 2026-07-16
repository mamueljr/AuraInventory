import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { container } from '@/application/container'
import { queryKeys } from '@/application/queries/keys'
import { seedDemoData } from '@/application/services/seed-service'

const { repos } = container

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms,
    queryFn: async () => (await repos.rooms.getAll()).sort((a, b) => a.order - b.order),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () =>
      (await repos.categories.getAll()).sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: async () => (await repos.tags.getAll()).sort((a, b) => a.name.localeCompare(b.name)),
  })
}

/** Carga los datos de ejemplo (solo actúa sobre una base vacía). */
export function useSeedDemo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => seedDemoData(container),
    onSuccess: () => qc.invalidateQueries(),
  })
}
