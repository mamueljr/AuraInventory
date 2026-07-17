import { Link } from 'react-router-dom'
import type { DistributionRow } from '@/application/queries/use-dashboard'

const MAX_ROWS = 7

/**
 * Barras horizontales de una sola serie (magnitud): marca delgada (≤24px),
 * punta redondeada 4px / base cuadrada, valor en la punta, texto en tokens
 * de texto. Más de 7 filas se pliegan en "Otros".
 */
export function BarList({
  rows,
  linkTo,
}: {
  rows: DistributionRow[]
  /** construye el destino del click (filtra el inventario por ese eje) */
  linkTo?: (row: DistributionRow) => string | undefined
}) {
  const visible = rows.slice(0, MAX_ROWS)
  const rest = rows.slice(MAX_ROWS)
  if (rest.length > 0) {
    visible.push({
      id: '__rest__',
      name: `Otros (${rest.length})`,
      count: rest.reduce((s, r) => s + r.count, 0),
      value: rest.reduce((s, r) => s + r.value, 0),
    })
  }
  const max = Math.max(...visible.map((r) => r.count), 1)

  return (
    <ul className="space-y-2.5">
      {visible.map((row) => {
        const to = row.id !== '__rest__' && row.id !== '__none__' ? linkTo?.(row) : undefined
        const bar = (
          <>
            <span className="text-aura-fg w-28 shrink-0 truncate text-sm sm:w-36">{row.name}</span>
            <span className="bg-aura-surface-2 relative h-5 flex-1 overflow-hidden rounded-r-[4px]">
              <span
                className="bg-aura-accent absolute inset-y-0 left-0 rounded-r-[4px] transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </span>
            <span className="text-aura-muted w-10 shrink-0 text-right text-sm tabular-nums">
              {row.count.toLocaleString('es-MX')}
            </span>
          </>
        )
        return (
          <li key={row.id}>
            {to ? (
              <Link
                to={to}
                className="focus-visible:ring-aura-ring flex items-center gap-3 rounded outline-none hover:opacity-80 focus-visible:ring-2"
                title={`Ver objetos: ${row.name}`}
              >
                {bar}
              </Link>
            ) : (
              <span className="flex items-center gap-3">{bar}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
