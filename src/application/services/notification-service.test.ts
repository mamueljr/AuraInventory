// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { createTestContainer } from '@/test/db'
import { newId } from '@/utils/ids'

let cleanup: (() => Promise<void>) | undefined
afterEach(async () => {
  await cleanup?.()
  cleanup = undefined
})

const days = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

describe('NotificationService', () => {
  it('duePending trae vencidos y próximos (7 días) ordenados por urgencia', async () => {
    const { container: c, db } = createTestContainer()
    cleanup = () => db.delete()

    const item = await c.itemService.create({ name: 'Router' })
    await c.repos.reminders.bulkPut([
      {
        id: newId(),
        itemId: item.id,
        type: 'warranty',
        dueAt: days(3),
        title: 'proxima',
        done: false,
      },
      { id: newId(), type: 'custom', dueAt: days(-2), title: 'vencida', done: false },
      { id: newId(), type: 'custom', dueAt: days(30), title: 'lejana', done: false },
      { id: newId(), type: 'custom', dueAt: days(1), title: 'hecha', done: true },
    ])

    const due = await c.notificationService.duePending()
    expect(due.map((d) => d.reminder.title)).toEqual(['vencida', 'proxima'])
    expect(due[0].daysLeft).toBeLessThan(0)
    expect(due[1].item?.name).toBe('Router')
  })

  it('takeUnnotified entrega cada aviso una sola vez y markDone lo saca de la lista', async () => {
    const { container: c, db } = createTestContainer()
    cleanup = () => db.delete()

    const id = newId()
    await c.repos.reminders.put({ id, type: 'custom', dueAt: days(0), title: 'hoy', done: false })

    expect((await c.notificationService.takeUnnotified()).length).toBe(1)
    expect((await c.notificationService.takeUnnotified()).length).toBe(0)

    await c.notificationService.markDone(id)
    expect((await c.notificationService.duePending()).length).toBe(0)
  })
})
