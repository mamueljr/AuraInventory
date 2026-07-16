// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Item } from '@/domain/entities'
import { isFilterActive, matchesFilter } from '@/domain/inventory-filter'

const item: Item = {
  id: '1',
  name: 'Laptop',
  quantity: 1,
  favorite: false,
  tagIds: ['t1'],
  collectionIds: ['c1'],
  roomId: 'sala',
  categoryId: 'electronica',
  subcategoryId: 'computo',
  createdAt: '',
  updatedAt: '',
}

describe('matchesFilter', () => {
  it('sin restricciones acepta todo', () => {
    expect(matchesFilter(item, {})).toBe(true)
    expect(isFilterActive({})).toBe(false)
  })

  it('filtra por cada eje', () => {
    expect(matchesFilter(item, { roomId: 'sala' })).toBe(true)
    expect(matchesFilter(item, { roomId: 'cocina' })).toBe(false)
    expect(matchesFilter(item, { tagId: 't1' })).toBe(true)
    expect(matchesFilter(item, { tagId: 'otro' })).toBe(false)
    expect(matchesFilter(item, { collectionId: 'c1' })).toBe(true)
    expect(matchesFilter(item, { favoritesOnly: true })).toBe(false)
  })

  it('categoría coincide contra categoría o subcategoría', () => {
    expect(matchesFilter(item, { categoryId: 'electronica' })).toBe(true)
    expect(matchesFilter(item, { categoryId: 'computo' })).toBe(true)
    expect(matchesFilter(item, { categoryId: 'muebles' })).toBe(false)
  })

  it('los ejes se combinan con AND', () => {
    expect(matchesFilter(item, { roomId: 'sala', tagId: 't1' })).toBe(true)
    expect(matchesFilter(item, { roomId: 'sala', tagId: 'otro' })).toBe(false)
  })
})
