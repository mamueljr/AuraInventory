import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3',
  {
    variants: {
      variant: {
        accent: 'bg-aura-accent-soft text-aura-accent',
        neutral: 'bg-aura-surface-2 text-aura-muted',
        outline: 'border border-aura-border text-aura-muted',
        success: 'bg-aura-success/12 text-aura-success',
        warning: 'bg-aura-warning/15 text-aura-warning',
        destructive: 'bg-aura-destructive/12 text-aura-destructive',
      },
    },
    defaultVariants: { variant: 'accent' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
