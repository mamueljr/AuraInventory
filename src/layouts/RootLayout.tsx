import { Outlet } from 'react-router-dom'
import { ThemeToggle, Toaster } from '@/design-system'

export function RootLayout() {
  return (
    <div className="min-h-dvh">
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>
      <Outlet />
      <Toaster />
    </div>
  )
}
