import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/pages/HomePage'

describe('HomePage', () => {
  it('muestra la marca Aura Inventory', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Aura\s*Inventory/)
  })
})
