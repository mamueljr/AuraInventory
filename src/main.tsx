import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/config/router'
import { initTheme } from '@/design-system'
import '@fontsource-variable/inter/index.css'
import '@/index.css'

initTheme()

// Utilidades de benchmark solo en desarrollo: __aura.seedBulk(50000) desde la consola
if (import.meta.env.DEV) {
  void Promise.all([
    import('@/application/container'),
    import('@/application/services/seed-service'),
  ]).then(([{ container }, { seedBulkItems, seedDemoData }]) => {
    Object.assign(window, {
      __aura: {
        container,
        seedDemo: () => seedDemoData(container),
        seedBulk: (n: number) => seedBulkItems(container, n),
      },
    })
  })
}

// Los datos viven en IndexedDB (sin red): reintentos y refetch agresivo no aportan.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
