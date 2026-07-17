import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { container } from '@/application/container'
import { seedDemoData } from '@/application/services/seed-service'
import { MapPage } from '@/pages/MapPage'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MapPage (integración)', () => {
  it('coloca habitaciones desde la bandeja y persiste su forma', async () => {
    await seedDemoData(container)
    renderPage()

    // activar edición
    const editSwitch = await screen.findByRole('switch', { name: /editar plano/i })
    fireEvent.click(editSwitch)

    // bandeja de no colocadas: colocar Sala y Cocina
    fireEvent.click(await screen.findByRole('button', { name: /sala/i }))
    fireEvent.click(await screen.findByRole('button', { name: /cocina/i }))

    await waitFor(async () => {
      const rooms = await container.repos.rooms.getAll()
      const placed = rooms.filter((r) => r.mapShape)
      expect(placed.map((r) => r.name).sort()).toEqual(['Cocina', 'Sala'])
    })

    // no se traslapan
    const rooms = await container.repos.rooms.getAll()
    const [a, b] = rooms.filter((r) => r.mapShape).map((r) => r.mapShape!)
    const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
    expect(overlap).toBe(false)

    // en modo vista, las piezas enlazan al inventario filtrado
    fireEvent.click(screen.getByRole('switch', { name: /editar plano/i }))
    expect((await screen.findAllByRole('link')).length).toBeGreaterThan(0)
  })
})
