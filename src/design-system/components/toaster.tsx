import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/design-system/theme/useTheme'

/** Toaster global tematizado con los tokens ADS. Montar una vez en el layout raíz. */
function Toaster() {
  const theme = useTheme((s) => s.theme)
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--aura-surface)',
          color: 'var(--aura-fg)',
          border: '1px solid var(--aura-border)',
          borderRadius: 'var(--aura-radius-control)',
          boxShadow: 'var(--aura-shadow-md)',
        },
      }}
    />
  )
}

export { Toaster }
