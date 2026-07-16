import {
  itemDraftSchema,
  type Item,
  type ItemDraft,
  type ItemEvent,
  type ItemEventType,
} from '@/domain/entities'
import type {
  AttachmentRepository,
  ItemEventRepository,
  ItemRepository,
  LoanRepository,
  PhotoRepository,
  ReminderRepository,
  UnitOfWork,
} from '@/domain/repositories'
import { newId, nowIso } from '@/utils/ids'

interface ItemServiceDeps {
  uow: UnitOfWork
  items: ItemRepository
  events: ItemEventRepository
  loans: LoanRepository
  photos: PhotoRepository
  attachments: AttachmentRepository
  reminders: ReminderRepository
}

/**
 * Reglas de negocio del inventario. La UI nunca escribe eventos ni recordatorios
 * a mano: cada mutación pasa por aquí y deja su rastro en la línea de tiempo
 * (el Pasaporte Digital se alimenta de esos ItemEvent).
 */
export class ItemService {
  private readonly deps: ItemServiceDeps

  constructor(deps: ItemServiceDeps) {
    this.deps = deps
  }

  async create(draft: ItemDraft): Promise<Item> {
    const parsed = itemDraftSchema.parse(draft)
    const now = nowIso()
    const item: Item = { ...parsed, id: newId(), createdAt: now, updatedAt: now }

    return this.deps.uow.run(async () => {
      await this.deps.items.put(item)
      await this.logEvent(item.id, 'created', 'Objeto registrado')
      if (item.purchaseDate) {
        await this.logEvent(item.id, 'purchased', 'Compra', {
          date: item.purchaseDate,
          detail: item.purchasePlace,
        })
      }
      await this.syncWarrantyReminder(item)
      return item
    })
  }

  async update(id: string, patch: Partial<ItemDraft>): Promise<Item> {
    const parsed = itemDraftSchema.partial().parse(patch)

    return this.deps.uow.run(async () => {
      const current = await this.mustGet(id)
      const updated: Item = { ...current, ...parsed, updatedAt: nowIso() }
      await this.deps.items.put(updated)

      if (parsed.roomId !== undefined && parsed.roomId !== current.roomId) {
        await this.logEvent(id, 'moved', 'Cambio de ubicación', {
          payload: { fromRoomId: current.roomId, toRoomId: parsed.roomId },
        })
      }
      if (parsed.currentValue !== undefined && parsed.currentValue !== current.currentValue) {
        await this.logEvent(id, 'value-updated', 'Valor actualizado', {
          payload: { from: current.currentValue, to: parsed.currentValue },
        })
      }
      await this.syncWarrantyReminder(updated)
      return updated
    })
  }

  async addComment(itemId: string, text: string): Promise<void> {
    await this.mustGet(itemId)
    await this.logEvent(itemId, 'comment', text)
  }

  async logMaintenance(
    itemId: string,
    data: { title: string; detail?: string; cost?: number; date?: string },
  ): Promise<void> {
    await this.mustGet(itemId)
    await this.logEvent(itemId, 'maintenance', data.title, {
      detail: data.detail,
      cost: data.cost,
      date: data.date,
    })
  }

  async loan(
    itemId: string,
    data: { borrowerName: string; borrowerContact?: string; dueAt?: string },
  ): Promise<void> {
    await this.deps.uow.run(async () => {
      await this.mustGet(itemId)
      const active = await this.deps.loans.getActiveByItem(itemId)
      if (active) throw new Error(`El objeto ya está prestado a ${active.borrowerName}`)

      await this.deps.loans.put({ id: newId(), itemId, loanedAt: nowIso(), ...data })
      await this.logEvent(itemId, 'loaned', `Prestado a ${data.borrowerName}`)
      if (data.dueAt) {
        await this.deps.reminders.put({
          id: newId(),
          itemId,
          type: 'loan-due',
          dueAt: data.dueAt,
          title: `Devolución: ${data.borrowerName}`,
          done: false,
        })
      }
    })
  }

  async returnLoan(itemId: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const active = await this.deps.loans.getActiveByItem(itemId)
      if (!active) throw new Error('El objeto no tiene un préstamo activo')

      await this.deps.loans.put({ ...active, returnedAt: nowIso() })
      await this.logEvent(itemId, 'returned', `Devuelto por ${active.borrowerName}`)
      const loanReminders = await this.deps.reminders.listByItem(itemId)
      for (const r of loanReminders.filter((r) => r.type === 'loan-due' && !r.done)) {
        await this.deps.reminders.put({ ...r, done: true })
      }
    })
  }

  /** A la papelera; restaurable con restore(). */
  async softDelete(id: string): Promise<void> {
    const current = await this.mustGet(id)
    await this.deps.items.put({ ...current, deletedAt: nowIso(), updatedAt: nowIso() })
  }

  async restore(id: string): Promise<void> {
    const current = await this.deps.items.getById(id)
    if (!current) throw new Error(`No existe el objeto ${id}`)
    await this.deps.items.put({ ...current, deletedAt: undefined, updatedAt: nowIso() })
  }

  /** Borrado definitivo: purga fotos, adjuntos, eventos, préstamos y recordatorios. */
  async purge(id: string): Promise<void> {
    await this.deps.uow.run(async () => {
      await this.deps.photos.deleteByItem(id)
      await this.deps.attachments.deleteByItem(id)
      await this.deps.events.deleteByItem(id)
      await this.deps.loans.deleteByItem(id)
      await this.deps.reminders.deleteByItem(id)
      await this.deps.items.delete(id)
    })
  }

  private async mustGet(id: string): Promise<Item> {
    const item = await this.deps.items.getById(id)
    if (!item || item.deletedAt) throw new Error(`No existe el objeto ${id}`)
    return item
  }

  private async logEvent(
    itemId: string,
    type: ItemEventType,
    title: string,
    extra: Partial<Pick<ItemEvent, 'detail' | 'payload' | 'cost' | 'date'>> = {},
  ): Promise<void> {
    await this.deps.events.put({
      id: newId(),
      itemId,
      type,
      title,
      date: extra.date ?? nowIso(),
      detail: extra.detail,
      payload: extra.payload,
      cost: extra.cost,
    })
  }

  /** warrantyUntil ⇒ recordatorio 'warranty' sincronizado (crea, actualiza o elimina). */
  private async syncWarrantyReminder(item: Item): Promise<void> {
    const existing = (await this.deps.reminders.listByItem(item.id)).find(
      (r) => r.type === 'warranty',
    )
    if (item.warrantyUntil) {
      await this.deps.reminders.put({
        id: existing?.id ?? newId(),
        itemId: item.id,
        type: 'warranty',
        dueAt: item.warrantyUntil,
        title: `Vence la garantía de ${item.name}`,
        done: existing?.done ?? false,
      })
    } else if (existing) {
      await this.deps.reminders.delete(existing.id)
    }
  }
}
