import { Outlet, useLocation } from 'react-router-dom'
import { Toaster, ThemeToggle } from '@/design-system'
import { AppHeader } from '@/layouts/AppHeader'

export function RootLayout() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

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
      <Toaster />
    </div>
  )
}
