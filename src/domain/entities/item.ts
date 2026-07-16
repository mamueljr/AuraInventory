import { z } from 'zod'

export const itemConditionSchema = z.enum(['new', 'like-new', 'good', 'fair', 'poor', 'broken'])
export type ItemCondition = z.infer<typeof itemConditionSchema>

/**
 * Datos que aporta el usuario al crear/editar un objeto.
 * El servicio completa id y timestamps; ver ItemService.
 */
export const itemDraftSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  condition: itemConditionSchema.optional(),
  serialNumber: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  purchasePrice: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  currentValue: z.number().nonnegative().optional(),
  purchaseDate: z.string().optional(),
  purchasePlace: z.string().optional(),
  supplier: z.string().optional(),
  warrantyUntil: z.string().optional(),
  roomId: z.string().optional(),
  locationId: z.string().optional(),
  notes: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  qrCode: z.string().optional(),
  barcode: z.string().optional(),
  coverPhotoId: z.string().optional(),
  favorite: z.boolean().default(false),
})
export type ItemDraft = z.input<typeof itemDraftSchema>

export const itemSchema = itemDraftSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
})
export type Item = z.output<typeof itemSchema>
