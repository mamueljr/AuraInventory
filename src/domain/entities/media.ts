import { z } from 'zod'

export const photoSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  order: z.number().int().nonnegative(),
  blob: z.instanceof(Blob), // WebP ~1600px
  thumbBlob: z.instanceof(Blob), // WebP ~320px
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  createdAt: z.string(),
})
export type Photo = z.infer<typeof photoSchema>

export const attachmentKindSchema = z.enum(['invoice', 'manual', 'other'])
export type AttachmentKind = z.infer<typeof attachmentKindSchema>

export const attachmentSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  kind: attachmentKindSchema,
  name: z.string().min(1),
  mimeType: z.string(),
  blob: z.instanceof(Blob),
  size: z.number().int().nonnegative(),
  createdAt: z.string(),
})
export type Attachment = z.infer<typeof attachmentSchema>
