// @vitest-environment node
// (jsdom sustituye Blob por uno no clonable; con el Blob nativo de Node el
// roundtrip por structured clone sí se ejercita de verdad)
import { afterEach, describe, expect, it } from 'vitest'
import type { Item } from '@/domain/entities'
import { createTestContainer } from '@/test/db'
import { newId, nowIso } from '@/utils/ids'

const makeItem = (over: Partial<Item> = {}): Item => ({
  id: newId(),
  name: 'Objeto',
  quantity: 1,
  favorite: false,
  tagIds: [],
  collectionIds: [],
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...over,
})

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

describe('DexieItemRepository', () => {
  it('CRUD básico', async () => {
    const { repos } = setup()
    const item = makeItem({ name: 'MacBook' })
    await repos.items.put(item)
    expect(await repos.items.getById(item.id)).toMatchObject({ name: 'MacBook' })
    await repos.items.delete(item.id)
    expect(await repos.items.getById(item.id)).toBeUndefined()
  })

  it('listRecent ordena por updatedAt desc y excluye soft-deleted', async () => {
    const { repos } = setup()
    await repos.items.bulkPut([
      makeItem({ name: 'viejo', updatedAt: '2026-01-01T00:00:00Z' }),
      makeItem({ name: 'nuevo', updatedAt: '2026-06-01T00:00:00Z' }),
      makeItem({ name: 'borrado', updatedAt: '2026-07-01T00:00:00Z', deletedAt: nowIso() }),
    ])
    const recent = await repos.items.listRecent()
    expect(recent.map((i) => i.name)).toEqual(['nuevo', 'viejo'])
    expect(await repos.items.countActive()).toBe(2)
    expect((await repos.items.listDeleted()).map((i) => i.name)).toEqual(['borrado'])
  })

  it('consulta por habitación, etiqueta (multiEntry) y favoritos', async () => {
    const { repos } = setup()
    const tagId = newId()
    await repos.items.bulkPut([
      makeItem({ name: 'a', roomId: 'sala', tagIds: [tagId], favorite: true }),
      makeItem({ name: 'b', roomId: 'sala' }),
      makeItem({ name: 'c', roomId: 'cocina', tagIds: [tagId, newId()] }),
    ])
    expect((await repos.items.listByRoom('sala')).length).toBe(2)
    expect((await repos.items.listByTag(tagId)).map((i) => i.name).sort()).toEqual(['a', 'c'])
    expect((await repos.items.listFavorites()).map((i) => i.name)).toEqual(['a'])
  })
})

describe('media y timeline', () => {
  it('fotos: roundtrip de blobs ordenado y borrado en cascada por item', async () => {
    const { repos } = setup()
    const itemId = newId()
    const blob = new Blob(['x'], { type: 'image/webp' })
    await repos.photos.bulkPut([
      {
        id: newId(),
        itemId,
        order: 1,
        blob,
        thumbBlob: blob,
        width: 10,
        height: 10,
        createdAt: nowIso(),
      },
      {
        id: newId(),
        itemId,
        order: 0,
        blob,
        thumbBlob: blob,
        width: 10,
        height: 10,
        createdAt: nowIso(),
      },
    ])
    const photos = await repos.photos.listByItem(itemId)
    expect(photos.map((p) => p.order)).toEqual([0, 1])
    expect(photos[0].blob).toBeInstanceOf(Blob)

    await repos.photos.deleteByItem(itemId)
    expect(await repos.photos.listByItem(itemId)).toEqual([])
  })

  it('eventos: línea de tiempo más reciente primero', async () => {
    const { repos } = setup()
    const itemId = newId()
    await repos.events.bulkPut([
      { id: newId(), itemId, type: 'created', date: '2026-01-01T00:00:00Z', title: 'alta' },
      { id: newId(), itemId, type: 'moved', date: '2026-03-01T00:00:00Z', title: 'mudanza' },
    ])
    expect((await repos.events.listByItem(itemId)).map((e) => e.title)).toEqual(['mudanza', 'alta'])
  })

  it('recordatorios pendientes hasta una fecha', async () => {
    const { repos } = setup()
    await repos.reminders.bulkPut([
      {
        id: newId(),
        type: 'warranty',
        dueAt: '2026-08-01T00:00:00Z',
        title: 'pronto',
        done: false,
      },
      { id: newId(), type: 'warranty', dueAt: '2027-01-01T00:00:00Z', title: 'lejos', done: false },
      { id: newId(), type: 'custom', dueAt: '2026-07-01T00:00:00Z', title: 'hecho', done: true },
    ])
    const pending = await repos.reminders.listPending('2026-09-01T00:00:00Z')
    expect(pending.map((r) => r.title)).toEqual(['pronto'])
  })
})
