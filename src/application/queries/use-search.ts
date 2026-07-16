import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { container } from '@/application/container'

/** Búsqueda instantánea vía worker; mantiene resultados previos mientras tecleas. */
export function useSearchQuery(query: string, enabled: boolean) {
  const q = query.trim()
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => container.searchService.search(q),
    enabled: enabled && q.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  })
}
