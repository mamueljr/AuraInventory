import { z } from 'zod'

export const itemEventTypeSchema = z.enum([
  'created',
  'purchased',
  'moved',
  'maintenance',
  'loaned',
  'returned',
  'value-updated',
  'comment',
  'custom',
])
export type ItemEventType = z.infer<typeof itemEventTypeSchema>

/** Entrada de la línea de tiempo de un objeto — el motor del Pasaporte Digital. */
export const itemEventSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  type: itemEventTypeSchema,
  date: z.string(),
  title: z.string().min(1),
  detail: z.string().optional(),
  /** contexto extra por tipo, p.ej. { fromRoomId, toRoomId } en 'moved' */
  payload: z.record(z.string(), z.unknown()).optional(),
  cost: z.number().nonnegative().optional(),
})
export type ItemEvent = z.infer<typeof itemEventSchema>

export const loanSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  borrowerName: z.string().min(1),
  borrowerContact: z.string().optional(),
  loanedAt: z.string(),
  dueAt: z.string().optional(),
  returnedAt: z.string().optional(),
})
export type Loan = z.infer<typeof loanSchema>

export const reminderTypeSchema = z.enum([
  'warranty',
  'maintenance',
  'expiry',
  'review',
  'loan-due',
  'custom',
])
export type ReminderType = z.infer<typeof reminderTypeSchema>

export const reminderSchema = z.object({
  id: z.string(),
  itemId: z.string().optional(),
  type: reminderTypeSchema,
  dueAt: z.string(),
  title: z.string().min(1),
  done: z.boolean(),
  notifiedAt: z.string().optional(),
})
export type Reminder = z.infer<typeof reminderSchema>
