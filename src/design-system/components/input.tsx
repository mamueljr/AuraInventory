import { cn } from '@/design-system/lib/cn'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        `rounded-control border-aura-border bg-aura-surface placeholder:text-aura-faint focus-visible:border-aura-accent focus-visible:ring-aura-ring h-10 w-full border px-3.5 text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    />
  )
}

export { Input }
