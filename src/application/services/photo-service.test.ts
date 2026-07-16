// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { fitWithin } from '@/application/services/photo-service'

describe('fitWithin', () => {
  it('reduce manteniendo proporción', () => {
    expect(fitWithin(3200, 2400, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin(2400, 3200, 1600)).toEqual({ width: 1200, height: 1600 })
  })

  it('nunca agranda imágenes pequeñas', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 })
  })

  it('resiste dimensiones extremas', () => {
    expect(fitWithin(10000, 10, 320).width).toBe(320)
    expect(fitWithin(10000, 10, 320).height).toBeGreaterThanOrEqual(1)
  })
})
