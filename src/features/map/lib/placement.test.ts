// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  clampShape,
  findFreeSpot,
  DEFAULT_SIZE,
  GRID_COLS,
  GRID_ROWS,
  MIN_H,
  MIN_W,
} from '@/features/map/lib/placement'

describe('clampShape', () => {
  it('impone tamaño mínimo y mantiene la pieza dentro del tablero', () => {
    expect(clampShape({ x: -5, y: -5, w: 1, h: 1 })).toEqual({ x: 0, y: 0, w: MIN_W, h: MIN_H })
    const clamped = clampShape({ x: 99, y: 99, w: 6, h: 4 })
    expect(clamped.x + clamped.w).toBeLessThanOrEqual(GRID_COLS)
    expect(clamped.y + clamped.h).toBeLessThanOrEqual(GRID_ROWS)
  })

  it('redondea a celdas enteras', () => {
    expect(clampShape({ x: 2.6, y: 1.2, w: 5.5, h: 3.7 })).toEqual({ x: 3, y: 1, w: 6, h: 4 })
  })
})

describe('findFreeSpot', () => {
  it('coloca la primera pieza en el origen', () => {
    expect(findFreeSpot([])).toEqual({ x: 0, y: 0, ...DEFAULT_SIZE })
  })

  it('evita traslapar piezas existentes', () => {
    const first = findFreeSpot([])
    const second = findFreeSpot([first])
    expect(second.x).toBeGreaterThanOrEqual(first.x + first.w)
  })

  it('salta de fila cuando la primera está llena', () => {
    const row = Array.from({ length: 4 }, (_, i) => ({ x: i * 6, y: 0, w: 6, h: 4 }))
    const next = findFreeSpot(row)
    expect(next.y).toBeGreaterThanOrEqual(4)
  })
})
