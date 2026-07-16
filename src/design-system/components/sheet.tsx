import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'
import { cn } from '@/design-system/lib/cn'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const sheetVariants = cva(
  `fixed z-50 flex flex-col gap-4 bg-aura-surface p-6 shadow-aura-lg transition
   data-[state=open]:animate-in data-[state=closed]:animate-out duration-300`,
  {
    variants: {
      side: {
        right: `inset-y-0 right-0 w-3/4 max-w-sm border-l border-aura-border
                data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right`,
        left: `inset-y-0 left-0 w-3/4 max-w-sm border-r border-aura-border
               data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left`,
        bottom: `inset-x-0 bottom-0 max-h-[85dvh] rounded-t-aura border-t border-aura-border
                 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom`,
      },
    },
    defaultVariants: { side: 'right' },
  },
)

function SheetContent({
  className,
  children,
  side,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & VariantProps<typeof sheetVariants>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={`data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm`}
      />
      <DialogPrimitive.Content className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <DialogPrimitive.Close
          className={`text-aura-muted hover:bg-aura-surface-2 hover:text-aura-fg focus-visible:ring-aura-ring absolute top-4 right-4 rounded-full p-1 transition-colors outline-none focus-visible:ring-2`}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('text-aura-muted text-sm', className)} {...props} />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription }
