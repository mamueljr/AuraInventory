import { BellIcon, CheckIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMarkReminderDone, usePendingReminders } from '@/application/queries/use-settings'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/design-system'

/** Campana del header: recordatorios vencidos o próximos (7 días). */
export function NotificationBell() {
  const { data: due } = usePendingReminders()
  const markDone = useMarkReminderDone()
  const count = due?.length ?? 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Recordatorios (${count})`}
          className="relative"
        >
          <BellIcon />
          {count > 0 && (
            <span className="bg-aura-destructive absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Recordatorios</DropdownMenuLabel>
        {count === 0 ? (
          <p className="text-aura-faint px-2.5 py-4 text-center text-sm">Todo al día ✨</p>
        ) : (
          due!.map(({ reminder, item, daysLeft }) => (
            <div key={reminder.id} className="flex items-start gap-2 px-2.5 py-2">
              <div className="min-w-0 flex-1">
                {item ? (
                  <Link
                    to={`/items/${item.id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {reminder.title}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-medium">{reminder.title}</p>
                )}
                <Badge
                  variant={daysLeft < 0 ? 'destructive' : daysLeft <= 2 ? 'warning' : 'neutral'}
                  className="mt-1"
                >
                  {daysLeft < 0
                    ? `venció hace ${-daysLeft} día${daysLeft === -1 ? '' : 's'}`
                    : daysLeft === 0
                      ? 'hoy'
                      : `en ${daysLeft} día${daysLeft === 1 ? '' : 's'}`}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Marcar hecho: ${reminder.title}`}
                onClick={() => markDone.mutate(reminder.id)}
              >
                <CheckIcon className="size-4" />
              </Button>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
