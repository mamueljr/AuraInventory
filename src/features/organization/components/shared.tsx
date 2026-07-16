import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@/design-system'

/** Input + botón para agregar entradas a un catálogo. */
export function InlineAdd({
  placeholder,
  onAdd,
  size = 'md',
}: {
  placeholder: string
  onAdd: (name: string) => void
  size?: 'sm' | 'md'
}) {
  const [value, setValue] = useState('')
  const submit = () => {
    const name = value.trim()
    if (!name) return
    onAdd(name)
    setValue('')
  }
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className={size === 'sm' ? 'h-8 text-xs' : undefined}
      />
      <Button
        variant="secondary"
        size={size === 'sm' ? 'sm' : 'md'}
        onClick={submit}
        disabled={!value.trim()}
        aria-label={placeholder}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}

/** Botón de borrado con confirmación; describe las consecuencias. */
export function ConfirmDelete({
  what,
  consequence,
  onConfirm,
}: {
  what: string
  consequence: string
  onConfirm: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Eliminar ${what}`}>
          <Trash2Icon className="text-aura-muted size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar {what}?</DialogTitle>
          <DialogDescription>{consequence}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Eliminar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Variante compacta del borrado confirmado, para chips (×). */
export function ConfirmDeleteInline({
  what,
  consequence,
  onConfirm,
}: {
  what: string
  consequence: string
  onConfirm: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Eliminar ${what}`}
          className="hover:text-aura-destructive -mr-0.5"
        >
          ×
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar {what}?</DialogTitle>
          <DialogDescription>{consequence}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Eliminar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Nombre editable inline (lápiz → input → check). */
export function EditableName({
  name,
  onRename,
  className,
}: {
  name: string
  onRename: (name: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)

  if (!editing) {
    return (
      <span className={`group/name flex min-w-0 items-center gap-1.5 ${className ?? ''}`}>
        <span className="truncate">{name}</span>
        <button
          type="button"
          aria-label={`Renombrar ${name}`}
          onClick={() => {
            setValue(name)
            setEditing(true)
          }}
          className="text-aura-faint hover:text-aura-fg opacity-0 transition-opacity group-hover/name:opacity-100 focus-visible:opacity-100"
        >
          <PencilIcon className="size-3.5" />
        </button>
      </span>
    )
  }
  const submit = () => {
    if (value.trim() && value.trim() !== name) onRename(value.trim())
    setEditing(false)
  }
  return (
    <span className="flex items-center gap-1.5">
      <Input
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="h-7 text-sm"
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={submit}
        aria-label="Guardar nombre"
      >
        <CheckIcon className="size-4" />
      </Button>
    </span>
  )
}
