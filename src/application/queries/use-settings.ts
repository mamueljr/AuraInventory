import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { container } from '@/application/container'
import { buildItemsCsv } from '@/application/services/backup-service'
import { queryKeys } from '@/application/queries/keys'
import { downloadBlob } from '@/utils/download'

const { repos, backupService, notificationService, itemService } = container

const today = () => new Date().toISOString().slice(0, 10)

export function useExportBackup() {
  return useMutation({
    mutationFn: async () => {
      const blob = await backupService.exportBackup()
      downloadBlob(blob, `aura-inventory-respaldo-${today()}.json`)
      return blob.size
    },
  })
}

export function useImportBackup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => backupService.importBackup(file),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useExportCsv() {
  return useMutation({
    mutationFn: async () => {
      const [items, rooms, categories] = await Promise.all([
        repos.items.listRecent(100000),
        repos.rooms.getAll(),
        repos.categories.getAll(),
      ])
      const csv = buildItemsCsv(items, {
        rooms: new Map(rooms.map((r) => [r.id, r.name])),
        categories: new Map(categories.map((c) => [c.id, c.name])),
      })
      downloadBlob(
        new Blob([csv], { type: 'text/csv;charset=utf-8' }),
        `aura-inventory-${today()}.csv`,
      )
      return items.length
    },
  })
}

// ── papelera ──────────────────────────────────────────────────────
export function useTrash() {
  return useQuery({
    queryKey: ['items', 'trash'],
    queryFn: () => repos.items.listDeleted(),
  })
}

export function usePurgeItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemService.purge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items.all }),
  })
}

// ── recordatorios ─────────────────────────────────────────────────
export function usePendingReminders() {
  return useQuery({
    queryKey: ['reminders', 'due'],
    queryFn: () => notificationService.duePending(),
    refetchInterval: 60_000,
  })
}

export function useMarkReminderDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationService.markDone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  })
}
