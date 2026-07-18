// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Item } from '@/domain/entities'
import { buildSearchDocs } from '@/data/search/build-docs'
import { createIndex, searchIndex } from '@/data/search/index-core'

const baseItem = (over: Partial<Item>): Item => ({
  id: crypto.randomUUID(),
  name: 'Objeto',
  quantity: 1,
  favorite: false,
  tagIds: [],
  collectionIds: [],
  createdAt: '',
  updatedAt: '',
  ...over,
})

describe('buildSearchDocs', () => {
  it('denormaliza nombres de catálogos y excluye la papelera', () => {
    const docs = buildSearchDocs(
      [
        baseItem({ id: 'a', name: 'Taladro', roomId: 'r1', tagIds: ['t1'], categoryId: 'c1' }),
        baseItem({ id: 'b', name: 'Borrado', deletedAt: 'x' }),
      ],
      [{ id: 'r1', name: 'Cochera', order: 0 }],
      [],
      [{ id: 'c1', name: 'Herramientas' }],
      [{ id: 't1', name: 'premium' }],
    )
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({
      roomName: 'Cochera',
      tagNames: 'premium',
      categoryName: 'Herramientas',
    })
  })
})

describe('searchIndex', () => {
  const docs = buildSearchDocs(
    [
      baseItem({ id: '1', name: 'MacBook Pro 14', brand: 'Apple', serialNumber: 'C02XL0GT' }),
      baseItem({ id: '2', name: 'Monitor LG 27', brand: 'LG', roomId: 'r1' }),
      baseItem({ id: '3', name: 'Licuadora', notes: 'regalo de mamá', roomId: 'r2' }),
    ],
    [
      { id: 'r1', name: 'Oficina', order: 0 },
      { id: 'r2', name: 'Cocina', order: 1 },
    ],
    [],
    [],
    [],
  )
  const ms = createIndex(docs)

  it('encuentra por nombre con prefijo y por número de serie', () => {
    expect(searchIndex(ms, 'macb')[0]?.id).toBe('1')
    expect(searchIndex(ms, 'C02XL0GT')[0]?.id).toBe('1')
  })

  it('encuentra por habitación y notas denormalizadas', () => {
    expect(searchIndex(ms, 'oficina')[0]?.id).toBe('2')
    expect(searchIndex(ms, 'regalo')[0]?.id).toBe('3')
  })

  it('tolera errores de dedo (fuzzy)', () => {
    expect(searchIndex(ms, 'licuadura')[0]?.id).toBe('3')
  })

  it('query vacío devuelve nada', () => {
    expect(searchIndex(ms, '  ')).toEqual([])
  })

  it('indexa 5,000 documentos rápido y busca en milisegundos', () => {
    const bulk = Array.from({ length: 5000 }, (_, i) =>
      baseItem({ id: `bulk-${i}`, name: `Objeto ${i}`, brand: i % 7 === 0 ? 'Bosch' : 'Generic' }),
    )
    const t0 = performance.now()
    const big = createIndex(buildSearchDocs(bulk, [], [], [], []))
    const buildMs = performance.now() - t0

    const t1 = performance.now()
    const hits = searchIndex(big, 'bosch objeto 49')
    const searchMs = performance.now() - t1

    expect(hits.length).toBeGreaterThan(0)
    // umbrales holgados: cazan regresiones de orden de magnitud sin ser flaky bajo carga de CI
    expect(buildMs).toBeLessThan(8000)
    expect(searchMs).toBeLessThan(500)
  })
})
