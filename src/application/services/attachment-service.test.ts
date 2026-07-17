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

const pdf = (name: string, sizeKB = 10) =>
  new File([new Uint8Array(sizeKB * 1024)], name, { type: 'application/pdf' })

describe('AttachmentService', () => {
  it('adjunta factura y manual a un objeto y los lista', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Laptop' })

    await c.attachmentService.add(item.id, pdf('factura.pdf'), 'invoice')
    await c.attachmentService.add(item.id, pdf('manual.pdf'), 'manual')

    const list = await c.repos.attachments.listByItem(item.id)
    expect(list.map((a) => a.kind).sort()).toEqual(['invoice', 'manual'])
    expect(list[0].blob).toBeInstanceOf(Blob)
  })

  it('rechaza tipos no permitidos y objetos inexistentes', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Laptop' })
    const exe = new File([new Uint8Array(10)], 'virus.exe', { type: 'application/x-msdownload' })

    await expect(c.attachmentService.add(item.id, exe, 'other')).rejects.toThrow(/PDF/)
    await expect(c.attachmentService.add('no-existe', pdf('x.pdf'), 'invoice')).rejects.toThrow()
  })

  it('purge del objeto elimina sus adjuntos', async () => {
    const c = setup()
    const item = await c.itemService.create({ name: 'Laptop' })
    await c.attachmentService.add(item.id, pdf('factura.pdf'), 'invoice')

    await c.itemService.purge(item.id)
    expect(await c.repos.attachments.listByItem(item.id)).toEqual([])
  })
})
