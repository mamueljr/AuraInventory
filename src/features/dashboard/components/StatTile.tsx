import { Card, CardContent, cn } from '@/design-system'

/**
 * Tile de KPI (contrato dataviz): label en sentence case, valor semibold con
 * figuras proporcionales. `hero` marca el número principal de la vista (≥48px).
 */
export function StatTile({
  label,
  value,
  hint,
  hero = false,
  icon,
}: {
  label: string
  value: string
  hint?: string
  hero?: boolean
  icon?: React.ReactNode
}) {
  return (
    <Card className={cn(hero && 'from-aura-accent-soft bg-gradient-to-br to-transparent')}>
      <CardContent className="space-y-1 p-5">
        <p className="text-aura-muted flex items-center gap-1.5 text-sm">
          {icon} {label}
        </p>
        <p className={cn('font-semibold tracking-tight', hero ? 'text-5xl' : 'text-2xl')}>
          {value}
        </p>
        {hint && <p className="text-aura-faint text-xs">{hint}</p>}
      </CardContent>
    </Card>
  )
}
