import { BookOpenIcon, FileTextIcon, PaperclipIcon, Trash2Icon } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'
import {
  useAddAttachment,
  useAttachments,
  useDeleteAttachment,
} from '@/application/queries/use-passport'
import type { Attachment, AttachmentKind } from '@/domain/entities'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/design-system'

const KIND_LABEL: Record<AttachmentKind, string> = {
  invoice: 'Factura',
  manual: 'Manual',
  other: 'Documento',
}

const KIND_ICON: Record<AttachmentKind, typeof FileTextIcon> = {
  invoice: FileTextIcon,
  manual: BookOpenIcon,
  other: PaperclipIcon,
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function AttachmentRow({ attachment, onDelete }: { attachment: Attachment; onDelete: () => void }) {
  const Icon = KIND_ICON[attachment.kind]

  const openFile = () => {
    const url = URL.createObjectURL(attachment.blob)
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div className="hover:bg-aura-surface-2 rounded-control -mx-2 flex items-center gap-3 px-2 py-2">
      <Icon className="text-aura-accent size-4 shrink-0" />
      <button
        type="button"
        onClick={openFile}
        className="min-w-0 flex-1 text-left"
        title="Abrir en una pestaña nueva"
      >
        <p className="truncate text-sm font-medium hover:underline">{attachment.name}</p>
        <p className="text-aura-faint text-xs">
          {KIND_LABEL[attachment.kind]} · {formatSize(attachment.size)}
        </p>
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${attachment.name}`}
        onClick={onDelete}
        className="text-aura-faint hover:text-aura-destructive p-1"
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  )
}

/** Facturas y manuales del objeto (PDF o imagen, hasta 20 MB). */
export function AttachmentsCard({ itemId }: { itemId: string }) {
  const { data: attachments } = useAttachments(itemId)
  const addAttachment = useAddAttachment(itemId)
  const deleteAttachment = useDeleteAttachment(itemId)
  const inputRef = useRef<HTMLInputElement>(null)
  const kindRef = useRef<AttachmentKind>('other')

  const pick = (kind: AttachmentKind) => {
    kindRef.current = kind
    inputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Documentos</CardTitle>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => pick('invoice')}>
            <FileTextIcon /> Factura
          </Button>
          <Button size="sm" variant="outline" onClick={() => pick('manual')}>
            <BookOpenIcon /> Manual
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file)
              addAttachment.mutate(
                { file, kind: kindRef.current },
                {
                  onSuccess: () => toast.success(`${KIND_LABEL[kindRef.current]} adjuntada`),
                  onError: (err) => toast.error(err.message),
                },
              )
            e.target.value = ''
          }}
        />
        {attachments && attachments.length > 0 ? (
          attachments.map((a) => (
            <AttachmentRow
              key={a.id}
              attachment={a}
              onDelete={() => deleteAttachment.mutate(a.id)}
            />
          ))
        ) : (
          <p className="text-aura-faint py-2 text-sm">
            Guarda aquí la factura y el manual — viajan con el objeto, incluso sin internet.
          </p>
        )}
        {attachments && attachments.length > 0 && (
          <div className="mt-2">
            <Badge variant="outline">{attachments.length} documento(s) offline</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
