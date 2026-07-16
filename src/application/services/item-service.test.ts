// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { seedDemoData } from '@/application/services/seed-service'
import { createTestContainer } from '@/test/db'

let cleanup: (() => Promise<void>) | undefined
afterEach(async () => {
  await cleanup?.()
  cleanup = undefined
})

function setup() {
  const { container, db } = createTestContainer()
  cleanup = () => db.delete()
  return container
}

describe('ItemService.create', () => {
  it('genera id/timestamps y registra el evento created', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Cámara' })
    expect(item.id).toMatch(/[0-9a-f-]{36}/)
    expect(item.createdAt).toBe(item.updatedAt)

    const timeline = await c.repos.events.listByItem(item.id)
    expect(timeline.map((e) => e.type)).toEqual(['created'])
  })

  it('con purchaseDate agrega evento purchased; con warrantyUntil crea recordatorio', async () => {
    const c = setup()
    const item = await c.itemService.create({
      name: 'Lavadora',
      purchaseDate: '2026-05-01',
      warrantyUntil: '2028-05-01',
    })
    const types = (await c.repos.events.listByItem(item.id)).map((e) => e.type)
    expect(types).toContain('purchased')

    const reminders = await c.repos.reminders.listByItem(item.id)
    expect(reminders).toHaveLength(1)
    expect(reminders[0]).toMatchObject({ type: 'warranty', dueAt: '2028-05-01' })
  })

  it('rechaza drafts inválidos', async () => {
    const c = setup()
    await expect(c.itemService.create({ name: '' })).rejects.toThrow()
  })
})

describe('ItemService.update', () => {
  it('cambio de habitación deja evento moved con payload', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Silla', roomId: 'sala' })
    await c.itemService.update(item.id, { roomId: 'oficina' })

    const moved = (await c.repos.events.listByItem(item.id)).find((e) => e.type === 'moved')
    expect(moved?.payload).toEqual({ fromRoomId: 'sala', toRoomId: 'oficina' })
  })

  it('quitar la garantía elimina su recordatorio', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'TV', warrantyUntil: '2027-01-01' })
    await c.itemService.update(item.id, { warrantyUntil: undefined })
    expect(await c.repos.reminders.listByItem(item.id)).toEqual([])
  })
})

describe('préstamos', () => {
  it('loan crea préstamo activo + evento + recordatorio; returnLoan lo cierra', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Dron' })
    await c.itemService.loan(item.id, { borrowerName: 'Ana', dueAt: '2026-08-01' })

    expect(await c.repos.loans.getActiveByItem(item.id)).toMatchObject({ borrowerName: 'Ana' })
    await expect(c.itemService.loan(item.id, { borrowerName: 'Luis' })).rejects.toThrow(/Ana/)

    await c.itemService.returnLoan(item.id)
    expect(await c.repos.loans.getActiveByItem(item.id)).toBeUndefined()

    const types = (await c.repos.events.listByItem(item.id)).map((e) => e.type)
    expect(types).toEqual(expect.arrayContaining(['loaned', 'returned']))

    const reminders = await c.repos.reminders.listByItem(item.id)
    expect(reminders.every((r) => r.done)).toBe(true)
  })
})

describe('papelera y purga', () => {
  it('softDelete manda a papelera y restore lo recupera', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Libro' })
    await c.itemService.softDelete(item.id)
    expect(await c.repos.items.countActive()).toBe(0)
    expect((await c.repos.items.listDeleted()).map((i) => i.name)).toEqual(['Libro'])

    await c.itemService.restore(item.id)
    expect(await c.repos.items.countActive()).toBe(1)
  })

  it('purge elimina el objeto y todo lo asociado', async () => {
    const c = setup()
    const item = await c.itemService.create({
      name: 'Consola',
      warrantyUntil: '2027-06-01',
    })
    const blob = new Blob(['x'])
    await c.repos.photos.put({
      id: 'p1',
      itemId: item.id,
      order: 0,
      blob,
      thumbBlob: blob,
      width: 1,
      height: 1,
      createdAt: item.createdAt,
    })
    await c.itemService.loan(item.id, { borrowerName: 'Ana' })

    await c.itemService.purge(item.id)
    expect(await c.repos.items.getById(item.id)).toBeUndefined()
    expect(await c.repos.photos.listByItem(item.id)).toEqual([])
    expect(await c.repos.events.listByItem(item.id)).toEqual([])
    expect(await c.repos.loans.getActiveByItem(item.id)).toBeUndefined()
    expect(await c.repos.reminders.listByItem(item.id)).toEqual([])
  })
})

describe('seedDemoData', () => {
  it('siembra datos demo una sola vez (idempotente)', async () => {
    const c = setup()
    expect(await seedDemoData(c)).toBe(true)
    expect(await c.repos.items.countActive()).toBe(10)
    expect((await c.repos.rooms.getAll()).length).toBe(5)

    expect(await seedDemoData(c)).toBe(false)
    expect(await c.repos.items.countActive()).toBe(10)
  })
})
