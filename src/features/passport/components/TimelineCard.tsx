import {
  HandHeartIcon,
  MessageSquareIcon,
  MoveRightIcon,
  PlusIcon,
  SendIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TrendingUpIcon,
  UndoDotIcon,
  WrenchIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useItemTimeline } from '@/application/queries/use-items'
import { useAddComment, useLogMaintenance } from '@/application/queries/use-passport'
import type { ItemEventType } from '@/domain/entities'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@/design-system'
import { formatCurrency, formatDate } from '@/utils/format'

const EVENT_META: Record<ItemEventType, { icon: typeof SparklesIcon; tone: string }> = {
  created: { icon: SparklesIcon, tone: 'text-aura-accent bg-aura-accent-soft' },
  purchased: { icon: ShoppingBagIcon, tone: 'text-aura-success bg-aura-success/12' },
  moved: { icon: MoveRightIcon, tone: 'text-aura-muted bg-aura-surface-2' },
  maintenance: { icon: WrenchIcon, tone: 'text-aura-warning bg-aura-warning/15' },
  loaned: { icon: HandHeartIcon, tone: 'text-aura-warning bg-aura-warning/15' },
  returned: { icon: UndoDotIcon, tone: 'text-aura-success bg-aura-success/12' },
  'value-updated': { icon: TrendingUpIcon, tone: 'text-aura-accent bg-aura-accent-soft' },
  comment: { icon: MessageSquareIcon, tone: 'text-aura-muted bg-aura-surface-2' },
  custom: { icon: SparklesIcon, tone: 'text-aura-muted bg-aura-surface-2' },
}

function MaintenanceDialog({ itemId }: { itemId: string }) {
  const logMaintenance = useLogMaintenance(itemId)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [cost, setCost] = useState('')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <WrenchIcon /> Mantenimiento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar mantenimiento</DialogTitle>
          <DialogDescription>Queda en el historial del objeto con su costo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="mt">¿Qué se hizo? *</Label>
            <Input
              id="mt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cambio de pasta térmica"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="md">Detalle</Label>
            <Textarea id="md" value={detail} onChange={(e) => setDetail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mc">Costo</Label>
            <Input
              id="mc"
              type="number"
              min={0}
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!title.trim() || logMaintenance.isPending}
            onClick={() =>
              logMaintenance.mutate(
                {
                  title: title.trim(),
                  detail: detail.trim() || undefined,
                  cost: cost ? Number(cost) : undefined,
                },
                {
                  onSuccess: () => {
                    setOpen(false)
                    setTitle('')
                    setDetail('')
                    setCost('')
                    toast.success('Mantenimiento registrado')
                  },
                  onError: (e) => toast.error(e.message),
                },
              )
            }
          >
            <PlusIcon /> Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Línea de tiempo del Pasaporte Digital + comentarios + mantenimientos. */
export function TimelineCard({ itemId }: { itemId: string }) {
  const { data: events } = useItemTimeline(itemId)
  const addComment = useAddComment(itemId)
  const [comment, setComment] = useState('')

  const submitComment = () => {
    const text = comment.trim()
    if (!text) return
    addComment.mutate(text, { onSuccess: () => setComment('') })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Línea de tiempo</CardTitle>
        <MaintenanceDialog itemId={itemId} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4 flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            placeholder="Escribe un comentario…"
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={submitComment}
            disabled={!comment.trim() || addComment.isPending}
            aria-label="Comentar"
          >
            <SendIcon />
          </Button>
        </div>

        <ol className="relative space-y-4">
          {events?.map((event, i) => {
            const meta = EVENT_META[event.type]
            const Icon = meta.icon
            return (
              <li key={event.id} className="relative flex gap-3">
                {i < events.length - 1 && (
                  <span
                    aria-hidden
                    className="bg-aura-border absolute top-8 left-[15px] h-[calc(100%-16px)] w-px"
                  />
                )}
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm leading-snug font-medium">{event.title}</p>
                  {event.detail && <p className="text-aura-muted text-sm">{event.detail}</p>}
                  <p className="text-aura-faint text-xs">
                    {formatDate(event.date)}
                    {event.cost !== undefined && ` · ${formatCurrency(event.cost)}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
