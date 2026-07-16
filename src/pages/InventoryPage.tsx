import { PackageOpenIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useRecentItems } from '@/application/queries/use-items'
import { useSeedDemo } from '@/application/queries/use-catalog'
import { Badge, Button, Skeleton } from '@/design-system'
import { ItemGrid } from '@/features/inventory/components/ItemGrid'

const GRID_LIMIT = 10000

export function InventoryPage() {
  const { data: items, isLoading } = useRecentItems(GRID_LIMIT)
  const seed = useSeedDemo()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Mis objetos</h1>
        {items && items.length > 0 && <Badge variant="neutral">{items.length}</Badge>}
        <Button asChild className="ml-auto">
          <Link to="/items/new">
            <PlusIcon /> Agregar
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="rounded-aura aspect-[4/5]" />
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <ItemGrid items={items} />
      ) : (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="bg-aura-accent-soft text-aura-accent flex size-16 items-center justify-center rounded-full">
            <PackageOpenIcon className="size-8" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-medium">Tu inventario está vacío</p>
            <p className="text-aura-muted max-w-sm text-sm">
              Registra tu primer objeto o carga datos de ejemplo para explorar la app.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/items/new">
                <PlusIcon /> Agregar objeto
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={seed.isPending}
              onClick={() =>
                seed.mutate(undefined, {
                  onSuccess: (seeded) =>
                    seeded
                      ? toast.success('Datos de ejemplo cargados')
                      : toast.info('La base ya tiene datos'),
                })
              }
            >
              <SparklesIcon /> Datos de ejemplo
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
