import MiniSearch from 'minisearch'

/**
 * Documento denormalizado que se indexa: los nombres de habitación, ubicación,
 * categoría y etiquetas se resuelven ANTES de indexar para que "cocina" o
 * "premium" encuentren objetos aunque esos textos vivan en otras tablas.
 */
export interface SearchDoc {
  id: string
  name: string
  brand?: string
  model?: string
  serialNumber?: string
  description?: string
  notes?: string
  tagNames?: string
  roomName?: string
  locationName?: string
  categoryName?: string
}

export interface SearchHit {
  id: string
  name: string
  brand?: string
  roomName?: string
  score: number
}

const FIELDS: (keyof SearchDoc)[] = [
  'name',
  'brand',
  'model',
  'serialNumber',
  'description',
  'notes',
  'tagNames',
  'roomName',
  'locationName',
  'categoryName',
]

export function createIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const ms = new MiniSearch<SearchDoc>({
    fields: FIELDS as string[],
    storeFields: ['name', 'brand', 'roomName'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.15,
      boost: { name: 3, serialNumber: 2, brand: 1.5 },
      combineWith: 'AND',
    },
  })
  ms.addAll(docs)
  return ms
}

export function searchIndex(ms: MiniSearch<SearchDoc>, query: string, limit = 12): SearchHit[] {
  if (!query.trim()) return []
  return ms
    .search(query)
    .slice(0, limit)
    .map((r) => ({
      id: String(r.id),
      name: r.name as string,
      brand: r.brand as string | undefined,
      roomName: r.roomName as string | undefined,
      score: r.score,
    }))
}
