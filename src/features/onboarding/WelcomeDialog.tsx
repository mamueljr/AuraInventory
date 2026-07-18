import { CameraIcon, MapIcon, SparklesIcon, WifiOffIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSeedDemo } from '@/application/queries/use-catalog'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/design-system'

const WELCOME_KEY = 'aura-welcomed'

const FEATURES = [
  { icon: CameraIcon, text: 'Fotografía tus cosas: se comprimen y viven en tu dispositivo.' },
  { icon: MapIcon, text: 'Dibuja el plano de tu casa y navega tu inventario por habitación.' },
  { icon: WifiOffIcon, text: 'Todo funciona sin internet. Tus datos son tuyos.' },
]

/** Bienvenida de primer uso: una sola vez, con salida a demo o a registrar. */
export function WelcomeDialog() {
  const [open, setOpen] = useState(() => !localStorage.getItem(WELCOME_KEY))
  const seed = useSeedDemo()
  const navigate = useNavigate()

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, '1')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight">
            Bienvenido a Aura <span className="text-aura-accent">Inventory</span>
          </DialogTitle>
          <DialogDescription>Todo lo que tienes, hermoso y en un solo lugar.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-2">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="bg-aura-accent-soft text-aura-accent flex size-8 shrink-0 items-center justify-center rounded-full">
                <Icon className="size-4" />
              </span>
              <span className="pt-1.5">{text}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            disabled={seed.isPending}
            onClick={() =>
              seed.mutate(undefined, {
                onSuccess: () => {
                  dismiss()
                  navigate('/items')
                  toast.success('Datos de ejemplo cargados — explora a gusto')
                },
              })
            }
          >
            <SparklesIcon /> Explorar con datos de ejemplo
          </Button>
          <Button
            onClick={() => {
              dismiss()
              navigate('/items/new')
            }}
          >
            Registrar mi primer objeto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
