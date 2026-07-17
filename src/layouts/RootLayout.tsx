import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { container } from '@/application/container'
import { Toaster, ThemeToggle } from '@/design-system'
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
      {isLanding ? (
        <div className="fixed top-4 right-4 z-40">
          <ThemeToggle />
        </div>
      ) : (
        <AppHeader />
      )}
      <div className={isLanding ? undefined : 'pt-14'}>
        <Outlet />
      </div>
      <SearchCommand />
      <Toaster />
    </div>
  )
}
