import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AttachmentKind } from '@/domain/entities'
import { container } from '@/application/container'
import { queryKeys } from '@/application/queries/keys'

const { repos, itemService, attachmentService } = container

export function useActiveLoan(itemId: string) {
  return useQuery({
    queryKey: ['loan', itemId],
    queryFn: async () => (await repos.loans.getActiveByItem(itemId)) ?? null,
  })
}

export function useAttachments(itemId: string) {
  return useQuery({
    queryKey: ['attachments', itemId],
    queryFn: () => repos.attachments.listByItem(itemId),
  })
}

/** Invalida timeline, préstamo, adjuntos e items tras cualquier mutación del pasaporte. */
function useInvalidatePassport(itemId: string) {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: queryKeys.timeline(itemId) })
    void qc.invalidateQueries({ queryKey: ['loan', itemId] })
    void qc.invalidateQueries({ queryKey: ['attachments', itemId] })
    void qc.invalidateQueries({ queryKey: queryKeys.items.all })
  }
}

export function useLoanItem(itemId: string) {
  const invalidate = useInvalidatePassport(itemId)
  return useMutation({
    mutationFn: (data: { borrowerName: string; borrowerContact?: string; dueAt?: string }) =>
      itemService.loan(itemId, data),
    onSuccess: invalidate,
  })
}

export function useReturnLoan(itemId: string) {
  const invalidate = useInvalidatePassport(itemId)
  return useMutation({
    mutationFn: () => itemService.returnLoan(itemId),
    onSuccess: invalidate,
  })
}

export function useAddComment(itemId: string) {
  const invalidate = useInvalidatePassport(itemId)
  return useMutation({
    mutationFn: (text: string) => itemService.addComment(itemId, text),
    onSuccess: invalidate,
  })
}

export function useLogMaintenance(itemId: string) {
  const invalidate = useInvalidatePassport(itemId)
  return useMutation({
    mutationFn: (data: { title: string; detail?: string; cost?: number; date?: string }) =>
      itemService.logMaintenance(itemId, data),
    onSuccess: invalidate,
  })
}

export function useAddAttachment(itemId: string) {
  const invalidate = useInvalidatePassport(itemId)
  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: AttachmentKind }) =>
      attachmentService.add(itemId, file, kind),
    onSuccess: invalidate,
  })
}

export function useDeleteAttachment(itemId: string) {
  const invalidate = useInvalidatePassport(itemId)
  return useMutation({
    mutationFn: (id: string) => attachmentService.remove(id),
    onSuccess: invalidate,
  })
}
