import type { Item, Reminder } from '@/domain/entities'
import type { ItemRepository, ReminderRepository } from '@/domain/repositories'
import { nowIso } from '@/utils/ids'

export interface DueReminder {
  reminder: Reminder
  item?: Item
  /** negativo = vencido hace N días */
  daysLeft: number
}

const HORIZON_DAYS = 7

interface NotificationServiceDeps {
  reminders: ReminderRepository
  items: ItemRepository
}

/**
 * Recordatorios (garantías, devoluciones de préstamos, mantenimientos).
 * La campana de la app es el canal principal; la Notifications API es el
 * refuerzo del sistema y usa `notifiedAt` para no repetir avisos.
 */
export class NotificationService {
  private readonly deps: NotificationServiceDeps

  constructor(deps: NotificationServiceDeps) {
    this.deps = deps
  }

  /** Pendientes vencidos o que vencen en los próximos 7 días, más urgente primero. */
  async duePending(now = new Date()): Promise<DueReminder[]> {
    const until = new Date(now.getTime() + HORIZON_DAYS * 86_400_000).toISOString()
    const pending = await this.deps.reminders.listPending(until)
    const withItems = await Promise.all(
      pending.map(async (reminder) => ({
        reminder,
        item: reminder.itemId ? await this.deps.items.getById(reminder.itemId) : undefined,
        daysLeft: Math.ceil((new Date(reminder.dueAt).getTime() - now.getTime()) / 86_400_000),
      })),
    )
    return withItems.sort((a, b) => a.daysLeft - b.daysLeft)
  }

  async markDone(reminderId: string): Promise<void> {
    const reminder = await this.deps.reminders.getById(reminderId)
    if (reminder) await this.deps.reminders.put({ ...reminder, done: true })
  }

  /** Los que aún no se han avisado por el sistema (y los marca como avisados). */
  async takeUnnotified(now = new Date()): Promise<DueReminder[]> {
    const due = await this.duePending(now)
    const fresh = due.filter(({ reminder }) => !reminder.notifiedAt)
    for (const { reminder } of fresh) {
      await this.deps.reminders.put({ ...reminder, notifiedAt: nowIso() })
    }
    return fresh
  }

  /** Notificación del sistema (si hay permiso). Llamar al arrancar la app. */
  async notifySystem(): Promise<void> {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const fresh = await this.takeUnnotified()
    for (const { reminder, item, daysLeft } of fresh) {
      const when =
        daysLeft < 0
          ? `venció hace ${-daysLeft} días`
          : daysLeft === 0
            ? 'vence hoy'
            : `vence en ${daysLeft} días`
      try {
        new Notification('Aura Inventory', {
          body: `${reminder.title}${item ? ` (${item.name})` : ''} — ${when}`,
          tag: reminder.id,
        })
      } catch {
        // algunos navegadores (Android) exigen ServiceWorker.showNotification — llega en v1.0
      }
    }
  }
}
