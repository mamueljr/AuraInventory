import { ArrowLeftIcon, HeartIcon, PackageIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCategories, useRooms } from '@/application/queries/use-catalog'
import {
  useDeleteItem,
  useItem,
  useRestoreItem,
  useToggleFavorite,
} from '@/application/queries/use-items'
import { usePhotos } from '@/application/queries/use-photos'
import type { Photo } from '@/domain/entities'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from '@/design-system'
import { formatCurrency, formatDate } from '@/utils/format'
import { useObjectUrl } from '@/utils/use-object-url'

const CONDITION_LABEL: Record<string, string> = {
  new: 'Nuevo',
  'like-new': 'Como nuevo',
  good: 'Bueno',
  fair: 'Regular',
  poor: 'Malo',
  broken: 'Descompuesto',
}

function Hero({ photo }: { photo: Photo | undefined }) {
  const url = useObjectUrl(photo?.blob)
  if (!photo)
    return (
      <div className="bg-aura-surface-2 text-aura-faint flex aspect-video items-center justify-center">
        <PackageIcon className="size-16" strokeWidth={1} />
      </div>
    )
  return (
    <div className="bg-aura-surface-2 aspect-video">
      {url && <img src={url} alt="" className="size-full object-contain" />}
    </div>
  )
}

function Thumb({ photo, active, onClick }: { photo: Photo; active: boolean; onClick: () => void }) {
  const url = useObjectUrl(photo.thumbBlob)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-control size-16 shrink-0 overflow-hidden border-2 transition-colors',
        active ? 'border-aura-accent' : 'border-transparent opacity-70 hover:opacity-100',
      )}
    >
      {url && <img src={url} alt="" className="size-full object-cover" />}
    </button>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-aura-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

export function ItemDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: item, isLoading } = useItem(id)
  const { data: photos } = usePhotos(id)
  const { data: rooms } = useRooms()
  const { data: categories } = useCategories()
  const toggleFavorite = useToggleFavorite()
  const deleteItem = useDeleteItem()
  const restoreItem = useRestoreItem()
  const [selectedPhoto, setSelectedPhoto] = useState<string>()

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="rounded-aura aspect-video" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40" />
      </main>
    )
  }

  if (!item || item.deletedAt) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-lg font-medium">Este objeto no existe (o está en la papelera)</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/items">
            <ArrowLeftIcon /> Volver al inventario
          </Link>
        </Button>
      </main>
    )
  }

  const room = rooms?.find((r) => r.id === item.roomId)
  const category = categories?.find((c) => c.id === item.categoryId)
  const subcategory = categories?.find((c) => c.id === item.subcategoryId)
  const current = photos?.find((p) => p.id === (selectedPhoto ?? item.coverPhotoId)) ?? photos?.[0]

  function handleDelete() {
    deleteItem.mutate(id, {
      onSuccess: () => {
        navigate('/items')
        toast('Objeto enviado a la papelera', {
          action: { label: 'Deshacer', onClick: () => restoreItem.mutate(id) },
        })
      },
    })
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/items">
          <ArrowLeftIcon /> Inventario
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <Hero photo={current} />
        {photos && photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {photos.map((p) => (
              <Thumb
                key={p.id}
                photo={p}
                active={p.id === current?.id}
                onClick={() => setSelectedPhoto(p.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="mt-6 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{item.name}</h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {category && <Badge>{category.name}</Badge>}
            {subcategory && <Badge variant="outline">{subcategory.name}</Badge>}
            {room && <Badge variant="neutral">{room.name}</Badge>}
            {item.quantity > 1 && <Badge variant="outline">×{item.quantity}</Badge>}
          </div>
        </div>
        <Button
          variant={item.favorite ? 'destructive' : 'outline'}
          size="icon"
          aria-label={item.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          aria-pressed={item.favorite}
          onClick={() => toggleFavorite.mutate({ id, favorite: !item.favorite })}
        >
          <HeartIcon className={cn(item.favorite && 'fill-current')} />
        </Button>
        <Button asChild variant="outline" size="icon" aria-label="Editar">
          <Link to={`/items/${id}/edit`}>
            <PencilIcon />
          </Link>
        </Button>
        <Button variant="outline" size="icon" aria-label="Enviar a papelera" onClick={handleDelete}>
          <Trash2Icon />
        </Button>
      </div>

      {item.description && <p className="text-aura-muted mt-3">{item.description}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detalles</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Row label="Marca" value={item.brand} />
            <Row label="Modelo" value={item.model} />
            <Row label="Color" value={item.color} />
            <Row label="Estado" value={item.condition && CONDITION_LABEL[item.condition]} />
            <Row label="No. de serie" value={item.serialNumber} />
            <Row label="Registrado" value={formatDate(item.createdAt)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compra y valor</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Row
              label="Precio de compra"
              value={
                item.purchasePrice !== undefined &&
                formatCurrency(item.purchasePrice, item.currency)
              }
            />
            <Row
              label="Valor actual"
              value={
                item.currentValue !== undefined && formatCurrency(item.currentValue, item.currency)
              }
            />
            <Row label="Fecha de compra" value={item.purchaseDate} />
            <Row label="Lugar" value={item.purchasePlace} />
            <Row label="Proveedor" value={item.supplier} />
            <Row label="Garantía" value={item.warrantyUntil && `hasta ${item.warrantyUntil}`} />
          </CardContent>
        </Card>
      </div>

      {item.notes && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Notas</CardTitle>
          </CardHeader>
          <CardContent className="text-aura-muted pt-3 text-sm whitespace-pre-wrap">
            {item.notes}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
