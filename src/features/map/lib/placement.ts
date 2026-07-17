import type { MapShape } from '@/domain/entities'

export const GRID_COLS = 24
export const GRID_ROWS = 16
export const MIN_W = 4
export const MIN_H = 3
export const DEFAULT_SIZE = { w: 6, h: 4 }

/** Mantiene la pieza dentro del tablero y con tamaño mínimo. */
export function clampShape(shape: MapShape): MapShape {
  const w = Math.min(GRID_COLS, Math.max(MIN_W, Math.round(shape.w)))
  const h = Math.min(GRID_ROWS, Math.max(MIN_H, Math.round(shape.h)))
  return {
    w,
    h,
    x: Math.min(GRID_COLS - w, Math.max(0, Math.round(shape.x))),
    y: Math.min(GRID_ROWS - h, Math.max(0, Math.round(shape.y))),
  }
}

const overlaps = (a: MapShape, b: MapShape) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

/**
 * Primer hueco libre (escaneo por filas) para una pieza nueva;
 * si el plano está lleno, cae en (0,0) — el usuario la acomoda.
 */
export function findFreeSpot(existing: MapShape[], size = DEFAULT_SIZE): MapShape {
  for (let y = 0; y <= GRID_ROWS - size.h; y++) {
    for (let x = 0; x <= GRID_COLS - size.w; x++) {
      const candidate = { x, y, ...size }
      if (!existing.some((s) => overlaps(candidate, s))) return candidate
    }
  }
  return { x: 0, y: 0, ...size }
}
