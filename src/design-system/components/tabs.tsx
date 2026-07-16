import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/design-system/lib/cn'

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'rounded-control bg-aura-surface-2 inline-flex h-10 items-center gap-1 p-1',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        `text-aura-muted focus-visible:ring-aura-ring data-[state=active]:bg-aura-surface data-[state=active]:text-aura-fg data-[state=active]:shadow-aura-sm inline-flex h-8 items-center justify-center rounded-[calc(var(--aura-radius-control)-4px)] px-3 text-sm font-medium transition-all outline-none focus-visible:ring-2`,
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('data-[state=active]:animate-aura-in mt-3 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
