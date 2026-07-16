import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/pages/HomePage'

describe('HomePage', () => {
  it('muestra la marca Aura Inventory', () => {
    render(<HomePage />, { wrapper: MemoryRouter })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Aura\s*Inventory/)
    expect(screen.getByRole('link', { name: /design system/i })).toBeInTheDocument()
  })
})
