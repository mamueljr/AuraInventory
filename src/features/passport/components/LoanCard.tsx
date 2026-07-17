import { HandHeartIcon, UndoDotIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useActiveLoan, useLoanItem, useReturnLoan } from '@/application/queries/use-passport'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@/design-system'
import { formatDate } from '@/utils/format'

/** Estado de préstamo del objeto: quién lo tiene, o el flujo para prestarlo. */
export function LoanCard({ itemId }: { itemId: string }) {
  const { data: loan } = useActiveLoan(itemId)
  const loanItem = useLoanItem(itemId)
  const returnLoan = useReturnLoan(itemId)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [dueAt, setDueAt] = useState('')

  if (loan) {
    return (
      <Card className="border-aura-warning/40 bg-aura-warning/8">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <HandHeartIcon className="text-aura-warning size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              Prestado a {loan.borrowerName}
              {loan.borrowerContact && (
                <span className="text-aura-muted font-normal"> · {loan.borrowerContact}</span>
              )}
            </p>
            <p className="text-aura-muted text-xs">
              desde {formatDate(loan.loanedAt)}
              {loan.dueAt && ` · devolución acordada: ${loan.dueAt}`}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={returnLoan.isPending}
            onClick={() =>
              returnLoan.mutate(undefined, {
                onSuccess: () => toast.success('Devolución registrada'),
                onError: (e) => toast.error(e.message),
              })
            }
          >
            <UndoDotIcon /> Registrar devolución
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HandHeartIcon /> Prestar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prestar objeto</DialogTitle>
          <DialogDescription>
            Quedará registrado en la línea de tiempo; si fijas fecha, te lo recordaremos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="borrower">¿A quién? *</Label>
            <Input
              id="borrower"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ana"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact">Contacto</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="teléfono, correo…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueAt">Fecha de devolución</Label>
            <Input
              id="dueAt"
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!name.trim() || loanItem.isPending}
            onClick={() =>
              loanItem.mutate(
                {
                  borrowerName: name.trim(),
                  borrowerContact: contact.trim() || undefined,
                  dueAt: dueAt || undefined,
                },
                {
                  onSuccess: () => {
                    setOpen(false)
                    setName('')
                    setContact('')
                    setDueAt('')
                    toast.success('Préstamo registrado')
                  },
                  onError: (e) => toast.error(e.message),
                },
              )
            }
          >
            Prestar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
