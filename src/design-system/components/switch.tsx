import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/design-system/lib/cn'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        `focus-visible:ring-aura-ring data-[state=checked]:bg-aura-accent data-[state=unchecked]:bg-aura-input inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={`shadow-aura-sm pointer-events-none block size-5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5`}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
