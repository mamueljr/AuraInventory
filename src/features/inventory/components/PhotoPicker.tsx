import { CameraIcon, XIcon } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/design-system'
import { useObjectUrl } from '@/utils/use-object-url'

interface PhotoPickerProps {
  files: File[]
  onChange: (files: File[]) => void
}

function Preview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useObjectUrl(file)

  return (
    <div className="group rounded-control relative aspect-square overflow-hidden">
      {url && <img src={url} alt="" className="size-full object-cover" />}
      <button
        type="button"
        aria-label="Quitar foto"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

/** Selección/captura de fotos con previews locales (se comprimen al guardar). */
export function PhotoPicker({ files, onChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onChange([...files, ...Array.from(e.target.files ?? [])])
          e.target.value = ''
        }}
      />
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, i) => (
            <Preview
              key={`${file.name}-${i}`}
              file={file}
              onRemove={() => onChange(files.filter((_, j) => j !== i))}
            />
          ))}
        </div>
      )}
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <CameraIcon /> {files.length ? 'Agregar más fotos' : 'Tomar o elegir fotos'}
      </Button>
      <p className="text-aura-faint text-xs">
        Se comprimen automáticamente a WebP (máx. 1600px) con miniatura para el grid.
      </p>
    </div>
  )
}
