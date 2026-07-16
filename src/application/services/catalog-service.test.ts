// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
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

describe('CatalogService', () => {
  it('createRoom asigna order incremental y createLocation exige habitación', async () => {
    const c = setup()
    const sala = await c.catalogService.createRoom('Sala')
    const cocina = await c.catalogService.createRoom('Cocina')
    expect([sala.order, cocina.order]).toEqual([0, 1])

    await expect(c.catalogService.createLocation('no-existe', 'Cajón')).rejects.toThrow()
    const cajon = await c.catalogService.createLocation(sala.id, 'Cajón 2')
    expect(cajon.roomId).toBe(sala.id)
  })

  it('deleteRoom limpia roomId/locationId de items y borra sus ubicaciones', async () => {
    const c = setup()
    const sala = await c.catalogService.createRoom('Sala')
    const cajon = await c.catalogService.createLocation(sala.id, 'Cajón')
    const item = await c.itemService.create({ name: 'Control', roomId: sala.id })
    await c.itemService.update(item.id, { locationId: cajon.id })

    await c.catalogService.deleteRoom(sala.id)

    const updated = await c.repos.items.getById(item.id)
    expect(updated?.roomId).toBeUndefined()
    expect(updated?.locationId).toBeUndefined()
    expect(await c.repos.rooms.getAll()).toEqual([])
    expect(await c.repos.locations.getAll()).toEqual([])
  })

  it('deleteCategory borra subcategorías y limpia referencias', async () => {
    const c = setup()
    const electronica = await c.catalogService.createCategory('Electrónica')
    const computo = await c.catalogService.createCategory('Cómputo', electronica.id)
    const otra = await c.catalogService.createCategory('Muebles')
    const item = await c.itemService.create({
      name: 'Laptop',
      categoryId: electronica.id,
      subcategoryId: computo.id,
    })

    await c.catalogService.deleteCategory(electronica.id)

    const updated = await c.repos.items.getById(item.id)
    expect(updated?.categoryId).toBeUndefined()
    expect(updated?.subcategoryId).toBeUndefined()
    expect((await c.repos.categories.getAll()).map((x) => x.id)).toEqual([otra.id])
  })

  it('deleteTag y deleteCollection quitan el id de los items', async () => {
    const c = setup()
    const tag = await c.catalogService.createTag('premium')
    const col = await c.catalogService.createCollection('Retro')
    const item = await c.itemService.create({
      name: 'Consola',
      tagIds: [tag.id],
      collectionIds: [col.id],
    })

    await c.catalogService.deleteTag(tag.id)
    await c.catalogService.deleteCollection(col.id)

    const updated = await c.repos.items.getById(item.id)
    expect(updated?.tagIds).toEqual([])
    expect(updated?.collectionIds).toEqual([])
  })
})
