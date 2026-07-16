import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function apply(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && media().matches)
  document.documentElement.classList.toggle('dark', dark)
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        apply(theme)
        set({ theme })
      },
    }),
    { name: 'aura-theme' },
  ),
)

/** Aplica el tema guardado al arrancar y sigue los cambios del SO en modo `system`. */
export function initTheme() {
  apply(useTheme.getState().theme)
  media().addEventListener('change', () => {
    if (useTheme.getState().theme === 'system') apply('system')
  })
}
