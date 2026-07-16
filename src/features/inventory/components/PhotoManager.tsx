import { StarIcon, Trash2Icon } from 'lucide-react'
import { useDeletePhoto, usePhotos } from '@/application/queries/use-photos'
import { useItem, useUpdateItem } from '@/application/queries/use-items'
import type { Photo } from '@/domain/entities'
import { cn } from '@/design-system'
import { useObjectUrl } from '@/utils/use-object-url'

function ManagedPhoto({
  photo,
  isCover,
  onDelete,
  onSetCover,
}: {
  photo: Photo
  isCover: boolean
  onDelete: () => void
  onSetCover: () => void
}) {
  const url = useObjectUrl(photo.thumbBlob)
  return (
    <div className="group rounded-control relative aspect-square overflow-hidden">
      {url && <img src={url} alt="" className="size-full object-cover" />}
      {isCover && (
        <span className="bg-aura-accent absolute top-1.5 left-1.5 rounded-full p-1 text-white">
          <StarIcon className="size-3 fill-current" />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {!isCover && (
          <button
            type="button"
            aria-label="Usar como portada"
            onClick={onSetCover}
            className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm"
          >
            <StarIcon className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          aria-label="Eliminar foto"
          onClick={onDelete}
          className={cn('rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm')}
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

/** Fotos ya guardadas de un objeto: portada y borrado inmediatos (modo edición). */
export function PhotoManager({ itemId }: { itemId: string }) {
  const { data: photos } = usePhotos(itemId)
  const { data: item } = useItem(itemId)
  const deletePhoto = useDeletePhoto(itemId)
  const updateItem = useUpdateItem()

  if (!photos?.length) return null
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Fotos guardadas</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <ManagedPhoto
            key={photo.id}
            photo={photo}
            isCover={item?.coverPhotoId === photo.id}
            onDelete={() => deletePhoto.mutate(photo.id)}
            onSetCover={() => updateItem.mutate({ id: itemId, patch: { coverPhotoId: photo.id } })}
          />
        ))}
      </div>
    </div>
  )
}
