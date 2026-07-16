import { Link } from 'react-router-dom'
import { Button } from '@/design-system'

export function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        aria-hidden
        className="bg-aura-accent-soft absolute h-64 w-64 rounded-full blur-3xl motion-safe:animate-pulse"
      />
      <span className="border-aura-accent/20 bg-aura-accent-soft text-aura-accent relative rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase">
        v0.1 · Fundación
      </span>
      <h1 className="relative text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
        Aura <span className="text-aura-accent">Inventory</span>
      </h1>
      <p className="text-aura-muted relative max-w-md text-lg text-pretty">
        Todo lo que tienes, hermoso y en un solo lugar. Offline primero, siempre contigo.
      </p>
      <Button asChild variant="outline" className="relative">
        <Link to="/design">Explorar el design system</Link>
      </Button>
    </main>
  )
}
