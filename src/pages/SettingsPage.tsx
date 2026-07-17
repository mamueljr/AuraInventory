import {
  BellRingIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  PackageIcon,
  Trash2Icon,
  UndoDotIcon,
  UploadIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRestoreItem } from '@/application/queries/use-items'
import {
  useExportBackup,
  useExportCsv,
  useImportBackup,
  usePurgeItem,
  useTrash,
} from '@/application/queries/use-settings'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system'
import { formatDate } from '@/utils/format'

function BackupSection() {
  const exportBackup = useExportBackup()
  const exportCsv = useExportCsv()
  const importBackup = useImportBackup()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Copia de seguridad</CardTitle>
        <CardDescription>
          El respaldo JSON incluye todo: objetos, fotos, documentos e historial. Funciona sin
          internet y sirve para mover tu inventario a otro dispositivo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-4">
        <Button
          disabled={exportBackup.isPending}
          onClick={() =>
            exportBackup.mutate(undefined, {
              onSuccess: (bytes) =>
                toast.success(`Respaldo descargado (${(bytes / 1024 / 1024).toFixed(1)} MB)`),
              onError: (e) => toast.error(e.message),
            })
          }
        >
          <DownloadIcon /> {exportBackup.isPending ? 'Exportando…' : 'Exportar respaldo'}
        </Button>
        <Button
          variant="outline"
          disabled={exportCsv.isPending}
          onClick={() =>
            exportCsv.mutate(undefined, {
              onSuccess: (n) => toast.success(`CSV con ${n} objetos descargado`),
            })
          }
        >
          <FileSpreadsheetIcon /> Exportar CSV
        </Button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setPendingFile(file)
            e.target.value = ''
          }}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <UploadIcon /> Importar respaldo
        </Button>

        <Dialog open={!!pendingFile} onOpenChange={(o) => !o && setPendingFile(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Restaurar “{pendingFile?.name}”?</DialogTitle>
              <DialogDescription>
                Esto REEMPLAZA todo tu inventario actual por el contenido del respaldo. La operación
                es transaccional: si el archivo es inválido, no se toca nada.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={importBackup.isPending}
                onClick={() =>
                  importBackup.mutate(pendingFile!, {
                    onSuccess: (r) => {
                      setPendingFile(null)
                      toast.success(
                        `Restaurado: ${r.items} objetos, ${r.photos} fotos, ${r.attachments} documentos`,
                      )
                    },
                    onError: (e) => toast.error(e.message),
                  })
                }
              >
                {importBackup.isPending ? 'Restaurando…' : 'Reemplazar todo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function NotificationsSection() {
  const supported = typeof Notification !== 'undefined'
  const [permission, setPermission] = useState(supported ? Notification.permission : 'denied')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Notificaciones</CardTitle>
        <CardDescription>
          La campana del menú siempre muestra tus recordatorios. Activa las notificaciones del
          sistema para recibir avisos aunque no tengas la app abierta en pantalla.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3 pt-4">
        {!supported ? (
          <Badge variant="neutral">No disponible en este navegador</Badge>
        ) : permission === 'granted' ? (
          <Badge variant="success">Activadas</Badge>
        ) : permission === 'denied' ? (
          <Badge variant="warning">Bloqueadas — actívalas en los permisos del sitio</Badge>
        ) : (
          <Button
            onClick={() => {
              void Notification.requestPermission().then((p) => {
                setPermission(p)
                if (p === 'granted') toast.success('Notificaciones activadas')
              })
            }}
          >
            <BellRingIcon /> Activar notificaciones
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function TrashSection() {
  const { data: trash } = useTrash()
  const restore = useRestoreItem()
  const purge = usePurgeItem()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Papelera</CardTitle>
        <CardDescription>
          Los objetos borrados se pueden restaurar. Vaciar es definitivo (incluye sus fotos y
          documentos).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 pt-4">
        {!trash || trash.length === 0 ? (
          <p className="text-aura-faint flex items-center gap-2 text-sm">
            <PackageIcon className="size-4" /> La papelera está vacía.
          </p>
        ) : (
          trash.map((item) => (
            <div key={item.id} className="flex items-center gap-2 py-1.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-aura-faint text-xs">
                  borrado el {item.deletedAt ? formatDate(item.deletedAt) : '—'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  restore.mutate(item.id, {
                    onSuccess: () => toast.success(`“${item.name}” restaurado`),
                  })
                }
              >
                <UndoDotIcon /> Restaurar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Eliminar definitivamente ${item.name}`}
                onClick={() =>
                  purge.mutate(item.id, {
                    onSuccess: () => toast.success('Eliminado definitivamente'),
                  })
                }
              >
                <Trash2Icon className="text-aura-destructive" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Ajustes</h1>
      <BackupSection />
      <NotificationsSection />
      <TrashSection />
    </main>
  )
}
