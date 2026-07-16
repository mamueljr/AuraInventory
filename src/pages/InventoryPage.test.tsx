import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { container } from '@/application/container'
import { seedDemoData } from '@/application/services/seed-service'
import { InventoryPage } from '@/pages/InventoryPage'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('InventoryPage (integración)', () => {
  it('muestra el estado vacío y luego el grid con datos sembrados', async () => {
    renderPage()
    expect(await screen.findByText('Tu inventario está vacío')).toBeInTheDocument()

    await seedDemoData(container)
    renderPage()
    expect(await screen.findByText('MacBook Pro 14"')).toBeInTheDocument()
    expect(await screen.findByText('Cafetera espresso')).toBeInTheDocument()
  })
})
