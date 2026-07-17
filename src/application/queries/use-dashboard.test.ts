// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { computeStats } from '@/application/queries/use-dashboard'
import { createTestContainer } from '@/test/db'

let cleanup: (() => Promise<void>) | undefined
afterEach(async () => {
  await cleanup?.()
  cleanup = undefined
})

describe('computeStats', () => {
  it('agrega valor, distribución y garantías por vencer', async () => {
    const { container: c, db } = createTestContainer()
    cleanup = () => db.delete()

    const sala = await c.catalogService.createRoom('Sala')
    const soon = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10)
    const far = new Date(Date.now() + 300 * 86_400_000).toISOString().slice(0, 10)

    await c.itemService.create({ name: 'TV', roomId: sala.id, purchasePrice: 1000, quantity: 2 })
    await c.itemService.create({ name: 'Consola', currentValue: 500, warrantyUntil: soon })
    await c.itemService.create({ name: 'Router', warrantyUntil: far })
    const borrado = await c.itemService.create({ name: 'Roto', purchasePrice: 9999 })
    await c.itemService.softDelete(borrado.id)

    const stats = await computeStats(c.repos)

    expect(stats.itemCount).toBe(3)
    expect(stats.totalValue).toBe(1000 * 2 + 500) // papelera excluida
    expect(stats.expiringWarranties.map(({ item }) => item.name)).toEqual(['Consola'])
    expect(stats.expiringWarranties[0].daysLeft).toBeGreaterThan(0)

    const salaRow = stats.byRoom.find((r) => r.id === sala.id)
    expect(salaRow).toMatchObject({ name: 'Sala', count: 1, value: 2000 })
    const sinRoom = stats.byRoom.find((r) => r.id === '__none__')
    expect(sinRoom?.count).toBe(2)
  })
})
