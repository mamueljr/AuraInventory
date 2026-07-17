import { BoxIcon, MapPinPlusIcon, PencilRulerIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/application/queries/use-dashboard'
import { useCatalogActions } from '@/application/queries/use-organize'
import { useRooms } from '@/application/queries/use-catalog'
import { Badge, Button, Label, Skeleton, Switch } from '@/design-system'
import { MapBoard, type RoomStats } from '@/features/map/components/MapBoard'

export function MapPage() {
  const { data: rooms, isLoading } = useRooms()
  const { data: stats } = useDashboardStats()
  const actions = useCatalogActions()
  const [editing, setEditing] = useState(false)
  const [tilted, setTilted] = useState(true)

  if (isLoading || !rooms) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="aspect-[3/2]" />
      </main>
    )
  }

  if (rooms.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Mapa</h1>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-aura-muted max-w-sm">
            El mapa dibuja el plano de tu casa. Primero crea tus habitaciones.
          </p>
          <Button asChild>
            <Link to="/organize">Crear habitaciones</Link>
          </Button>
        </div>
      </main>
    )
  }

  const roomStats = new Map<string, RoomStats>(
    stats?.byRoom.map((r) => [r.id, { count: r.count, value: r.value }]) ?? [],
  )
  const unplaced = rooms.filter((r) => !r.mapShape)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Mapa</h1>
        <div className="ml-auto flex items-center gap-2">
          <PencilRulerIcon className="text-aura-muted size-4" />
          <Label htmlFor="edit-map">Editar plano</Label>
          <Switch
            id="edit-map"
            checked={editing}
            onCheckedChange={(v) => {
              setEditing(v)
              if (v) setTilted(false)
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <BoxIcon className="text-aura-muted size-4" />
          <Label htmlFor="tilt-map">Vista 3D</Label>
          <Switch id="tilt-map" checked={tilted} onCheckedChange={setTilted} disabled={editing} />
        </div>
      </div>

      {editing && unplaced.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-aura-muted text-sm">Sin colocar:</span>
          {unplaced.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => actions.placeRoomOnMap.mutate([room.id])}
            >
              <Badge variant="outline" className="gap-1.5">
                <MapPinPlusIcon className="size-3" /> {room.name}
              </Badge>
            </button>
          ))}
        </div>
      )}

      <MapBoard
        rooms={rooms}
        stats={roomStats}
        editing={editing}
        tilted={tilted && !editing}
        onShapeChange={(roomId, shape) => actions.setRoomShape.mutate([roomId, shape])}
      />

      <p className="text-aura-faint mt-4 text-sm">
        {editing
          ? 'Arrastra las piezas para acomodarlas; usa la esquina inferior derecha para cambiar su tamaño.'
          : 'Toca una habitación para ver sus objetos.'}
      </p>
    </main>
  )
}
