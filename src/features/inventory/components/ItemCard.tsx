import { HeartIcon, PackageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePhoto } from '@/application/queries/use-photos'
import { useToggleFavorite } from '@/application/queries/use-items'
import type { Item } from '@/domain/entities'
import { cn } from '@/design-system'
import { formatCurrency } from '@/utils/format'
import { useObjectUrl } from '@/utils/use-object-url'

export function ItemCard({ item }: { item: Item }) {
  const { data: cover } = usePhoto(item.coverPhotoId)
  const thumbUrl = useObjectUrl(cover?.thumbBlob)
  const toggleFavorite = useToggleFavorite()

  return (
    <Link
      to={`/items/${item.id}`}
      className={`group rounded-aura border-aura-border bg-aura-surface hover:shadow-aura-md focus-visible:ring-aura-ring relative block overflow-hidden border transition-all outline-none focus-visible:ring-2 motion-safe:hover:-translate-y-0.5`}
    >
      <div className="bg-aura-surface-2 relative aspect-square overflow-hidden">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="text-aura-faint flex size-full items-center justify-center">
            <PackageIcon className="size-10" strokeWidth={1.25} />
          </div>
        )}
        <button
          type="button"
          aria-label={item.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          aria-pressed={item.favorite}
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite.mutate({ id: item.id, favorite: !item.favorite })
          }}
          className={cn(
            `absolute top-2 right-2 rounded-full p-2 backdrop-blur-sm transition-all active:scale-90`,
            item.favorite
              ? 'bg-aura-destructive/85 text-white opacity-100'
              : 'bg-black/25 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          )}
        >
          <HeartIcon className={cn('size-4', item.favorite && 'fill-current')} />
        </button>
      </div>
      <div className="space-y-0.5 p-3">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-aura-muted truncate text-xs">
          {[item.brand, item.purchasePrice && formatCurrency(item.purchasePrice, item.currency)]
            .filter(Boolean)
            .join(' · ') || '—'}
        </p>
      </div>
    </Link>
  )
}
