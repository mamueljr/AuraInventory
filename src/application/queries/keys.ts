/** Claves de TanStack Query centralizadas para invalidación consistente. */
export const queryKeys = {
  items: {
    all: ['items'] as const,
    recent: (limit?: number) => ['items', 'recent', limit] as const,
    detail: (id: string) => ['items', 'detail', id] as const,
    byRoom: (roomId: string) => ['items', 'room', roomId] as const,
    count: ['items', 'count'] as const,
  },
  rooms: ['rooms'] as const,
  categories: ['categories'] as const,
  tags: ['tags'] as const,
  collections: ['collections'] as const,
  timeline: (itemId: string) => ['timeline', itemId] as const,
}
