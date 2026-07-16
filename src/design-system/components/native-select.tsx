import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/design-system/lib/cn'

/** Select nativo estilizado: máxima accesibilidad y soporte móvil sin JS extra. */
function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(
          `rounded-control border-aura-border bg-aura-surface focus-visible:border-aura-accent focus-visible:ring-aura-ring h-10 w-full appearance-none border px-3.5 pr-9 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="text-aura-faint pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  )
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        `rounded-control border-aura-border bg-aura-surface placeholder:text-aura-faint focus-visible:border-aura-accent focus-visible:ring-aura-ring min-h-20 w-full border px-3.5 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect, Textarea }
