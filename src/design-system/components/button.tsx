import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/lib/cn'

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium
   whitespace-nowrap transition-all outline-none select-none
   focus-visible:ring-2 focus-visible:ring-aura-ring
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        primary: `bg-aura-accent text-aura-accent-fg shadow-aura-sm
                  hover:bg-aura-accent-hover hover:shadow-aura-glow`,
        secondary: 'bg-aura-surface-2 text-aura-fg hover:bg-aura-border/60',
        outline: 'border border-aura-border bg-transparent hover:bg-aura-surface-2',
        ghost: 'hover:bg-aura-accent-soft hover:text-aura-accent',
        destructive: 'bg-aura-destructive text-aura-destructive-fg hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { Button, buttonVariants, type ButtonProps }
