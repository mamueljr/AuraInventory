import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MapShape, Room } from '@/domain/entities'
import { cn } from '@/design-system'
import { GRID_COLS, GRID_ROWS, clampShape } from '@/domain/map-placement'
import { formatCurrencyCompact } from '@/utils/format'

export interface RoomStats {
  count: number
  value: number
}

interface MapBoardProps {
  rooms: Room[]
  stats: Map<string, RoomStats>
  editing: boolean
  tilted: boolean
  onShapeChange: (roomId: string, shape: MapShape) => void
}

interface DragState {
  roomId: string
  mode: 'move' | 'resize'
  startX: number
  startY: number
  origin: MapShape
}

/**
 * Plano de la casa en un grid lógico de 24×16. En edición las piezas se
 * arrastran (y redimensionan desde la esquina); en vista, tap → inventario
 * de esa habitación. El modo "3D" es una inclinación CSS solo visual.
 */
export function MapBoard({ rooms, stats, editing, tilted, onShapeChange }: MapBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [preview, setPreview] = useState<Record<string, MapShape>>({})
  const navigate = useNavigate()

  const placed = rooms.filter((r) => r.mapShape)

  const cellSize = () => {
    const width = boardRef.current?.getBoundingClientRect().width ?? 960
    return width / GRID_COLS
  }

  const startDrag = (e: React.PointerEvent, room: Room, mode: DragState['mode']) => {
    if (!editing || !room.mapShape) return
    e.preventDefault()
    try {
      ;(e.target as Element).setPointerCapture(e.pointerId)
    } catch {
      // algunos pointers (sintéticos, pen huérfano) no admiten captura; el drag funciona igual
    }
    setDrag({ roomId: room.id, mode, startX: e.clientX, startY: e.clientY, origin: room.mapShape })
  }

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return
    const cell = cellSize()
    const dx = (e.clientX - drag.startX) / cell
    const dy = (e.clientY - drag.startY) / cell
    const next =
      drag.mode === 'move'
        ? { ...drag.origin, x: drag.origin.x + dx, y: drag.origin.y + dy }
        : { ...drag.origin, w: drag.origin.w + dx, h: drag.origin.h + dy }
    setPreview((p) => ({ ...p, [drag.roomId]: clampShape(next) }))
  }

  const endDrag = () => {
    if (!drag) return
    const shape = preview[drag.roomId]
    if (shape) onShapeChange(drag.roomId, shape)
    setDrag(null)
    setPreview({})
  }

  return (
    <div className={cn(tilted && '[perspective:1400px]')}>
      <div
        ref={boardRef}
        className={cn(
          'border-aura-border bg-aura-surface relative w-full rounded-xl border transition-transform duration-500',
          tilted && 'scale-90 [transform:rotateX(42deg)_rotateZ(-8deg)]',
        )}
        style={{
          aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
          backgroundImage:
            'linear-gradient(var(--aura-border) 1px, transparent 1px), linear-gradient(90deg, var(--aura-border) 1px, transparent 1px)',
          backgroundSize: `${100 / GRID_COLS}% ${100 / GRID_ROWS}%`,
          backgroundPosition: '-1px -1px',
        }}
      >
        {placed.map((room) => {
          const shape = preview[room.id] ?? room.mapShape!
          const stat = stats.get(room.id)
          const dragging = drag?.roomId === room.id
          return (
            <div
              key={room.id}
              role={editing ? undefined : 'link'}
              onPointerDown={(e) => startDrag(e, room, 'move')}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onClick={() => !editing && navigate(`/items?room=${room.id}`)}
              className={cn(
                `bg-aura-accent-soft border-aura-accent/30 absolute overflow-hidden rounded-lg border p-2 transition-shadow select-none`,
                editing ? 'cursor-grab touch-none' : 'hover:shadow-aura-glow cursor-pointer',
                dragging && 'shadow-aura-lg z-10 cursor-grabbing',
                tilted && 'shadow-aura-md [transform:translateZ(14px)]',
              )}
              style={{
                left: `${(shape.x / GRID_COLS) * 100}%`,
                top: `${(shape.y / GRID_ROWS) * 100}%`,
                width: `${(shape.w / GRID_COLS) * 100}%`,
                height: `${(shape.h / GRID_ROWS) * 100}%`,
              }}
            >
              <p className="truncate text-xs font-semibold sm:text-sm">{room.name}</p>
              {stat && stat.count > 0 ? (
                <p className="text-aura-muted text-[10px] sm:text-xs">
                  {stat.count} objeto{stat.count === 1 ? '' : 's'}
                  <span className="max-sm:hidden"> · {formatCurrencyCompact(stat.value)}</span>
                </p>
              ) : (
                <p className="text-aura-faint text-[10px] sm:text-xs">vacía</p>
              )}
              {editing && (
                <span
                  aria-hidden
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    startDrag(e, room, 'resize')
                  }}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  className="border-aura-accent absolute right-0.5 bottom-0.5 size-3.5 cursor-nwse-resize touch-none rounded-sm border-r-2 border-b-2"
                />
              )}
            </div>
          )
        })}

        {placed.length === 0 && (
          <div className="text-aura-faint absolute inset-0 flex items-center justify-center text-sm">
            Activa “Editar plano” y coloca tus habitaciones.
          </div>
        )}
      </div>
    </div>
  )
}
