import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import type { Item } from '@/domain/entities'
import { ItemCard } from '@/features/inventory/components/ItemCard'

const MIN_CARD_PX = 170
const GAP_PX = 12
const CARD_TEXT_PX = 64

/**
 * Grid virtualizado por filas (soporta decenas de miles de objetos):
 * solo se montan las tarjetas visibles + overscan.
 */
export function ItemGrid({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ columns: 4, width: 1024, top: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      const columns = Math.max(2, Math.floor((width + GAP_PX) / (MIN_CARD_PX + GAP_PX)))
      setLayout({ columns, width, top: el.offsetTop })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { columns, width } = layout
  const cardWidth = (width - GAP_PX * (columns - 1)) / columns
  const rowHeight = cardWidth + CARD_TEXT_PX + GAP_PX

  const virtualizer = useWindowVirtualizer({
    count: Math.ceil(items.length / columns),
    estimateSize: () => rowHeight,
    overscan: 4,
    scrollMargin: layout.top,
  })

  return (
    <div ref={containerRef}>
      <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            className="absolute inset-x-0 grid"
            style={{
              transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: GAP_PX,
            }}
          >
            {items.slice(row.index * columns, (row.index + 1) * columns).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
