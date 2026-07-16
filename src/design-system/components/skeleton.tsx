import { cn } from '@/design-system/lib/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-control bg-aura-surface-2 animate-pulse', className)} {...props} />
  )
}

export { Skeleton }
