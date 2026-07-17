import {
  ArrowRightIcon,
  BellIcon,
  CameraIcon,
  HeartIcon,
  PackageIcon,
  PlusIcon,
  ShieldAlertIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/application/queries/use-dashboard'
import { usePhoto } from '@/application/queries/use-photos'
import type { Item } from '@/domain/entities'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/design-system'
import { StatTile } from '@/features/dashboard/components/StatTile'
import { BarList } from '@/features/dashboard/components/BarList'
import { formatCurrency } from '@/utils/format'
import { useObjectUrl } from '@/utils/use-object-url'

function RecentCard({ item }: { item: Item }) {
  const { data: cover } = usePhoto(item.coverPhotoId)
  const url = useObjectUrl(cover?.thumbBlob)
  return (
    <Link
      to={`/items/${item.id}`}
      className="focus-visible:ring-aura-ring group w-24 shrink-0 space-y-1.5 outline-none focus-visible:ring-2"
    >
      <div className="bg-aura-surface-2 rounded-control aspect-square overflow-hidden">
        {url ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="text-aura-faint flex size-full items-center justify-center">
            <PackageIcon className="size-6" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="truncate text-xs">{item.name}</p>
    </Link>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading || !stats) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </main>
    )
  }

  if (stats.itemCount === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Panel</h1>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="bg-aura-accent-soft text-aura-accent flex size-16 items-center justify-center rounded-full">
            <PackageIcon className="size-8" strokeWidth={1.5} />
          </div>
          <p className="text-aura-muted max-w-sm">
            Cuando registres objetos, aquí verás el valor de tu inventario, garantías por vencer y
            cómo se distribuye todo.
          </p>
          <Button asChild>
            <Link to="/items/new">
              <PlusIcon /> Registrar mi primer objeto
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
        <Button asChild size="sm">
          <Link to="/items/new">
            <PlusIcon /> Agregar
          </Link>
        </Button>
      </div>

      {/* KPI row: un solo hero + tiles secundarios */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3 lg:col-span-1">
          <StatTile
            hero
            label="Valor del inventario"
            value={formatCurrency(stats.totalValue)}
            hint={`${stats.itemCount.toLocaleString('es-MX')} objetos registrados`}
          />
        </div>
        <StatTile
          label="Objetos"
          value={stats.itemCount.toLocaleString('es-MX')}
          icon={<PackageIcon className="size-4" />}
        />
        <StatTile
          label="Favoritos"
          value={stats.favoriteCount.toLocaleString('es-MX')}
          icon={<HeartIcon className="size-4" />}
        />
        <StatTile
          label="Fotos"
          value={stats.photoCount.toLocaleString('es-MX')}
          icon={<CameraIcon className="size-4" />}
        />
      </div>

      {stats.expiringWarranties.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <ShieldAlertIcon className="text-aura-warning size-4" />
            <CardTitle className="text-sm">Garantías por vencer (90 días)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-3">
            {stats.expiringWarranties.slice(0, 5).map(({ item, daysLeft }) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="hover:bg-aura-surface-2 rounded-control -mx-2 flex items-center justify-between gap-2 px-2 py-1.5 text-sm"
              >
                <span className="truncate">{item.name}</span>
                <Badge variant={daysLeft <= 14 ? 'destructive' : 'warning'}>
                  <BellIcon /> {daysLeft === 0 ? 'hoy' : `${daysLeft} días`}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Objetos por habitación</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <BarList rows={stats.byRoom} linkTo={(r) => `/items?room=${r.id}`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Objetos por categoría</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <BarList rows={stats.byCategory} linkTo={(r) => `/items?category=${r.id}`} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">Recién agregados</CardTitle>
          <Link
            to="/items"
            className="text-aura-accent flex items-center gap-1 text-xs font-medium hover:underline"
          >
            Ver todo <ArrowRightIcon className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="flex gap-3 overflow-x-auto pt-4">
          {stats.recent.map((item) => (
            <RecentCard key={item.id} item={item} />
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
