import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  /** presente → es subcategoría de parentId */
  parentId: z.string().optional(),
})
export type Category = z.infer<typeof categorySchema>

/** Pieza del plano del Mapa Inteligente (v0.9); rectángulo en unidades de grid. */
export const mapShapeSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
})
export type MapShape = z.infer<typeof mapShapeSchema>

export const roomSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().nonnegative(),
  mapShape: mapShapeSchema.optional(),
})
export type Room = z.infer<typeof roomSchema>

/** Ubicación fina dentro de una habitación: "cajón 2", "estante A". */
export const locationSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  name: z.string().min(1),
})
export type Location = z.infer<typeof locationSchema>

export const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().optional(),
})
export type Tag = z.infer<typeof tagSchema>

export const collectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  coverPhotoId: z.string().optional(),
})
export type Collection = z.infer<typeof collectionSchema>
