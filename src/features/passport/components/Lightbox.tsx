import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { useState } from 'react'
import type { Photo } from '@/domain/entities'
import { Button, Dialog, DialogContent, DialogTitle, cn } from '@/design-system'
import { useObjectUrl } from '@/utils/use-object-url'

interface LightboxProps {
  photos: Photo[]
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FullPhoto({ photo, zoomed }: { photo: Photo; zoomed: boolean }) {
  const url = useObjectUrl(photo.blob)
  if (!url) return null
  return (
    <div className={cn('flex max-h-[82vh] items-center justify-center', zoomed && 'overflow-auto')}>
      <img
        src={url}
        alt=""
        className={cn(
          'transition-transform duration-200',
          zoomed ? 'max-w-none scale-150 cursor-zoom-out' : 'max-h-[82vh] w-auto cursor-zoom-in',
        )}
      />
    </div>
  )
}

/** Galería a pantalla completa con zoom y navegación (flechas y teclado). */
export function Lightbox({ photos, index, onIndexChange, open, onOpenChange }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false)
  const photo = photos[index]
  if (!photo) return null

  const prev = () => onIndexChange((index - 1 + photos.length) % photos.length)
  const next = () => onIndexChange((index + 1) % photos.length)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setZoomed(false)
      }}
    >
      <DialogContent
        className="w-[calc(100%-1rem)] max-w-4xl bg-black/90 p-2"
        aria-describedby={undefined}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prev()
          if (e.key === 'ArrowRight') next()
        }}
      >
        <DialogTitle className="sr-only">Fotografía a pantalla completa</DialogTitle>
        <div onClick={() => setZoomed((z) => !z)}>
          <FullPhoto photo={photo} zoomed={zoomed} />
        </div>
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          {photos.length > 1 && (
            <Button variant="secondary" size="icon" onClick={prev} aria-label="Foto anterior">
              <ChevronLeftIcon />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? 'Alejar' : 'Acercar'}
          >
            {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
          </Button>
          {photos.length > 1 && (
            <Button variant="secondary" size="icon" onClick={next} aria-label="Foto siguiente">
              <ChevronRightIcon />
            </Button>
          )}
          {photos.length > 1 && (
            <span className="ml-1 text-xs text-white/80">
              {index + 1} / {photos.length}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
