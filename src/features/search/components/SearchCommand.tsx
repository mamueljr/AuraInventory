import { CornerDownLeftIcon, PackageIcon, SearchIcon } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchQuery } from '@/application/queries/use-search'
import { Dialog, DialogContent, DialogTitle, cn } from '@/design-system'
import { useSearchStore } from '@/features/search/store'

export function SearchCommand() {
  const { open, setOpen } = useSearchStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()

  const deferred = useDeferredValue(query)
  const { data, isFetching } = useSearchQuery(deferred, open)
  const hits = data?.hits ?? []

  // atajo global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useSearchStore.getState().setOpen(!useSearchStore.getState().open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    setQuery('')
    navigate(`/items/${id}`)
  }

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, hits.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    }
    if (e.key === 'Enter' && hits[selected]) go(hits[selected].id)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery('')
      }}
    >
      <DialogContent className="top-24 max-w-lg translate-y-0 p-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Buscar objetos</DialogTitle>
        <div className="border-aura-border flex items-center gap-2 border-b px-4">
          <SearchIcon className="text-aura-faint size-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={onInputKey}
            placeholder="Buscar por nombre, marca, serie, habitación, etiqueta…"
            autoFocus
            className="placeholder:text-aura-faint h-12 w-full bg-transparent text-sm outline-none"
          />
          {isFetching && (
            <span className="border-aura-accent size-3.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <p className="text-aura-faint px-3 py-6 text-center text-sm">
              Escribe para buscar en todo tu inventario.
            </p>
          ) : hits.length === 0 && !isFetching ? (
            <p className="text-aura-faint px-3 py-6 text-center text-sm">
              Sin resultados para “{query}”.
            </p>
          ) : (
            <ul role="listbox" aria-label="Resultados">
              {hits.map((hit, i) => (
                <li key={hit.id} role="option" aria-selected={i === selected}>
                  <button
                    type="button"
                    onClick={() => go(hit.id)}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      'rounded-control flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm',
                      i === selected && 'bg-aura-accent-soft text-aura-accent',
                    )}
                  >
                    <PackageIcon className="size-4 shrink-0 opacity-60" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{hit.name}</span>
                      {(hit.brand || hit.roomName) && (
                        <span className="text-aura-muted block truncate text-xs">
                          {[hit.brand, hit.roomName].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </span>
                    {i === selected && <CornerDownLeftIcon className="size-3.5 opacity-60" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && (
          <p className="border-aura-border text-aura-faint border-t px-4 py-2 text-[11px]">
            {hits.length} resultados en {data.ms.toFixed(1)} ms
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
