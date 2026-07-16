import type { Photo } from '@/domain/entities'
import type { ItemRepository, PhotoRepository, UnitOfWork } from '@/domain/repositories'
import { newId, nowIso } from '@/utils/ids'

const MAX_PHOTO_PX = 1600
const MAX_THUMB_PX = 320
const PHOTO_QUALITY = 0.82
const THUMB_QUALITY = 0.7

/** Escala (solo hacia abajo) manteniendo proporción. */
export function fitWithin(width: number, height: number, maxPx: number) {
  const scale = Math.min(1, maxPx / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

async function renderWebP(bitmap: ImageBitmap, maxPx: number, quality: number): Promise<Blob> {
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxPx)

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
    return canvas.convertToBlob({ type: 'image/webp', quality })
  }

  // Fallback para navegadores sin OffscreenCanvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
      'image/webp',
      quality,
    ),
  )
}

/** Comprime un archivo de imagen a WebP (original acotado + thumbnail). */
export async function compressImage(file: Blob): Promise<{
  blob: Blob
  thumbBlob: Blob
  width: number
  height: number
}> {
  const bitmap = await createImageBitmap(file)
  try {
    const dims = fitWithin(bitmap.width, bitmap.height, MAX_PHOTO_PX)
    const [blob, thumbBlob] = await Promise.all([
      renderWebP(bitmap, MAX_PHOTO_PX, PHOTO_QUALITY),
      renderWebP(bitmap, MAX_THUMB_PX, THUMB_QUALITY),
    ])
    return { blob, thumbBlob, ...dims }
  } finally {
    bitmap.close()
  }
}

interface PhotoServiceDeps {
  uow: UnitOfWork
  items: ItemRepository
  photos: PhotoRepository
}

export class PhotoService {
  private readonly deps: PhotoServiceDeps

  constructor(deps: PhotoServiceDeps) {
    this.deps = deps
  }

  /** Comprime y adjunta fotos a un objeto; la primera se vuelve portada si no hay. */
  async addPhotos(itemId: string, files: Blob[]): Promise<Photo[]> {
    const existing = await this.deps.photos.listByItem(itemId)
    let order = existing.length ? Math.max(...existing.map((p) => p.order)) + 1 : 0

    const compressed = await Promise.all(files.map((f) => compressImage(f)))
    const photos: Photo[] = compressed.map((c) => ({
      id: newId(),
      itemId,
      order: order++,
      createdAt: nowIso(),
      ...c,
    }))

    return this.deps.uow.run(async () => {
      await this.deps.photos.bulkPut(photos)
      const item = await this.deps.items.getById(itemId)
      if (item && !item.coverPhotoId) {
        await this.deps.items.put({ ...item, coverPhotoId: photos[0].id, updatedAt: nowIso() })
      }
      return photos
    })
  }

  async deletePhoto(photoId: string): Promise<void> {
    await this.deps.uow.run(async () => {
      const photo = await this.deps.photos.getById(photoId)
      if (!photo) return
      await this.deps.photos.delete(photoId)

      const item = await this.deps.items.getById(photo.itemId)
      if (item?.coverPhotoId === photoId) {
        const rest = await this.deps.photos.listByItem(photo.itemId)
        await this.deps.items.put({ ...item, coverPhotoId: rest[0]?.id, updatedAt: nowIso() })
      }
    })
  }

  async setCover(itemId: string, photoId: string): Promise<void> {
    const item = await this.deps.items.getById(itemId)
    if (!item) throw new Error(`No existe el objeto ${itemId}`)
    await this.deps.items.put({ ...item, coverPhotoId: photoId, updatedAt: nowIso() })
  }
}
