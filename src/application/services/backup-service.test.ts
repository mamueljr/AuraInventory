// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { buildItemsCsv } from '@/application/services/backup-service'
import { createTestContainer } from '@/test/db'

let cleanup: (() => Promise<void>) | undefined
afterEach(async () => {
  await cleanup?.()
  cleanup = undefined
})

describe('BackupService', () => {
  it('roundtrip: exportar → borrar todo → importar deja la base idéntica', async () => {
    const { container: c, db } = createTestContainer()
    cleanup = () => db.delete()

    const sala = await c.catalogService.createRoom('Sala')
    const item = await c.itemService.create({
      name: 'Cámara',
      roomId: sala.id,
      warrantyUntil: '2027-01-01',
    })
    await c.itemService.loan(item.id, { borrowerName: 'Ana' })
    const photoBytes = new Uint8Array([137, 80, 78, 71, 0, 255, 128, 7])
    await c.repos.photos.put({
      id: 'p1',
      itemId: item.id,
      order: 0,
      blob: new Blob([photoBytes], { type: 'image/webp' }),
      thumbBlob: new Blob([photoBytes.slice(0, 4)], { type: 'image/webp' }),
      width: 2,
      height: 2,
      createdAt: item.createdAt,
    })
    await c.attachmentService.add(
      item.id,
      new File([new Uint8Array(64)], 'factura.pdf', { type: 'application/pdf' }),
      'invoice',
    )

    const backup = await c.backupService.exportBackup()

    for (const table of db.tables) await table.clear()
    expect(await c.repos.items.countActive()).toBe(0)

    const result = await c.backupService.importBackup(backup)
    expect(result).toMatchObject({ items: 1, photos: 1, attachments: 1 })

    const restored = await c.repos.items.getById(item.id)
    expect(restored?.name).toBe('Cámara')
    expect(restored?.roomId).toBe(sala.id)

    const photo = (await c.repos.photos.listByItem(item.id))[0]
    expect(new Uint8Array(await photo.blob.arrayBuffer())).toEqual(photoBytes)
    expect(photo.blob.type).toBe('image/webp')

    expect(await c.repos.loans.getActiveByItem(item.id)).toMatchObject({ borrowerName: 'Ana' })
    expect((await c.repos.reminders.listByItem(item.id)).length).toBeGreaterThan(0)
    expect((await c.repos.events.listByItem(item.id)).length).toBeGreaterThan(0)
  })

  it('rechaza archivos que no son respaldos válidos', async () => {
    const { container: c, db } = createTestContainer()
    cleanup = () => db.delete()

    await expect(c.backupService.importBackup(new Blob(['no json {']))).rejects.toThrow(/JSON/)
    await expect(
      c.backupService.importBackup(new Blob([JSON.stringify({ app: 'otra-app' })])),
    ).rejects.toThrow(/respaldo válido/)
  })
})

describe('buildItemsCsv', () => {
  it('resuelve nombres y escapa comas/comillas', () => {
    const csv = buildItemsCsv(
      [
        {
          id: '1',
          name: 'TV "Smart", 55',
          quantity: 1,
          favorite: true,
          tagIds: [],
          collectionIds: [],
          roomId: 'r1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      { rooms: new Map([['r1', 'Sala']]), categories: new Map() },
    )
    const lines = csv.split('\n')
    expect(lines[0]).toContain('nombre')
    expect(lines[1]).toContain('"TV ""Smart"", 55"')
    expect(lines[1]).toContain('Sala')
    expect(lines[1]).toContain('sí')
  })
})
