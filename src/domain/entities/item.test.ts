import { describe, expect, it } from 'vitest'
import { itemDraftSchema } from '@/domain/entities'

describe('itemDraftSchema', () => {
  it('acepta un draft mínimo y aplica defaults', () => {
    const parsed = itemDraftSchema.parse({ name: 'Taladro' })
    expect(parsed).toMatchObject({ name: 'Taladro', quantity: 1, favorite: false, tagIds: [] })
  })

  it('rechaza nombre vacío', () => {
    expect(() => itemDraftSchema.parse({ name: '   ' })).toThrow()
  })

  it('rechaza cantidades y precios inválidos', () => {
    expect(() => itemDraftSchema.parse({ name: 'X', quantity: 0 })).toThrow()
    expect(() => itemDraftSchema.parse({ name: 'X', purchasePrice: -1 })).toThrow()
    expect(() => itemDraftSchema.parse({ name: 'X', condition: 'destruido' })).toThrow()
  })
})
