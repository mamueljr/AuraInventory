import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { container } from '@/application/container'
import { Toaster, ThemeToggle } from '@/design-system'
import { WelcomeDialog } from '@/features/onboarding/WelcomeDialog'
import { SearchCommand } from '@/features/search/components/SearchCommand'
import { AppHeader } from '@/layouts/AppHeader'

export function RootLayout() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  // avisos del sistema para recordatorios vencidos (si hay permiso)
  useEffect(() => {
    void container.notificationService.notifySystem().catch(() => {})
  }, [])

  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="focus:bg-aura-accent sr-only z-50 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-lg focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Saltar al contenido
      </a>
      {isLanding ? (
        <div className="fixed top-4 right-4 z-40">
          <ThemeToggle />
        </div>
      ) : (
        <AppHeader />
      )}
      <div id="contenido" className={isLanding ? undefined : 'pt-14'}>
        <Outlet />
      </div>
      <SearchCommand />
      <WelcomeDialog />
      <Toaster />
    </div>
  )
}
