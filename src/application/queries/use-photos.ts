import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { container } from '@/application/container'
import { queryKeys } from '@/application/queries/keys'

const { repos, photoService } = container

export function usePhotos(itemId: string) {
  return useQuery({
    queryKey: ['photos', itemId],
    queryFn: () => repos.photos.listByItem(itemId),
  })
}

/** Foto individual (para portadas en el grid). */
export function usePhoto(photoId: string | undefined) {
  return useQuery({
    queryKey: ['photo', photoId],
    queryFn: async () => (photoId ? ((await repos.photos.getById(photoId)) ?? null) : null),
    enabled: !!photoId,
  })
}

function useInvalidatePhotos(itemId: string) {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: ['photos', itemId] })
    void qc.invalidateQueries({ queryKey: ['photo'] })
    void qc.invalidateQueries({ queryKey: queryKeys.items.all })
  }
}

export function useAddPhotos(itemId: string) {
  const invalidate = useInvalidatePhotos(itemId)
  return useMutation({
    mutationFn: (files: File[]) => photoService.addPhotos(itemId, files),
    onSuccess: invalidate,
  })
}

export function useDeletePhoto(itemId: string) {
  const invalidate = useInvalidatePhotos(itemId)
  return useMutation({
    mutationFn: (photoId: string) => photoService.deletePhoto(photoId),
    onSuccess: invalidate,
  })
}
