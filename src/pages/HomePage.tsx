import { motion } from 'motion/react'
import { ArrowRightIcon, SparklesIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system'

const APP_VERSION = 'v1.0'

const stagger = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.6, ease: [0.21, 1.02, 0.73, 1] as const },
  }),
}

export function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      {/* Aura: dos halos que respiran detrás del wordmark */}
      <motion.div
        aria-hidden
        className="bg-aura-accent/25 absolute h-105 w-105 rounded-full blur-3xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="bg-aura-success/15 absolute h-72 w-72 translate-x-24 -translate-y-16 rounded-full blur-3xl"
        animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.span
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={0}
        className="border-aura-accent/20 bg-aura-accent-soft text-aura-accent relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-widest uppercase"
      >
        <SparklesIcon className="size-3" /> {APP_VERSION} · Instálame
      </motion.span>

      <motion.h1
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={1}
        className="relative text-5xl font-semibold tracking-tight text-balance sm:text-7xl"
      >
        Aura{' '}
        <span className="from-aura-accent to-aura-accent-hover bg-gradient-to-br bg-clip-text text-transparent">
          Inventory
        </span>
      </motion.h1>

      <motion.p
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={2}
        className="text-aura-muted relative max-w-md text-lg text-pretty"
      >
        Todo lo que tienes, hermoso y en un solo lugar. Offline primero, siempre contigo.
      </motion.p>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        custom={3}
        className="relative flex flex-wrap items-center justify-center gap-3"
      >
        <Button asChild size="lg">
          <Link to="/items">
            Mis objetos <ArrowRightIcon />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link to="/design">Design system</Link>
        </Button>
      </motion.div>
    </main>
  )
}
