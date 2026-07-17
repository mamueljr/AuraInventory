import { SearchIcon } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { Button, ThemeToggle, cn } from '@/design-system'
import { useSearchStore } from '@/features/search/store'

const links = [
  { to: '/dashboard', label: 'Panel' },
  { to: '/items', label: 'Objetos' },
  { to: '/map', label: 'Mapa' },
  { to: '/organize', label: 'Organizar' },
  { to: '/design', label: 'Design' },
]

export function AppHeader() {
  return (
    <header className="glass fixed inset-x-0 top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
        <Link to="/" className="mr-2 flex items-center gap-2 font-semibold tracking-tight">
          <span className="from-aura-accent to-aura-accent-hover flex size-7 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white">
            A
          </span>
          <span className="max-sm:sr-only">Aura Inventory</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Principal">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-control px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-aura-accent-soft text-aura-accent'
                    : 'text-aura-muted hover:text-aura-fg',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => useSearchStore.getState().setOpen(true)}
            className="text-aura-muted gap-2"
          >
            <SearchIcon /> <span className="max-sm:hidden">Buscar</span>
            <kbd className="bg-aura-surface-2 rounded px-1.5 py-0.5 font-sans text-[10px] max-sm:hidden">
              ⌘K
            </kbd>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
