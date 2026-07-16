import { useEffect, useMemo } from 'react'

/** URL de objeto para un Blob, revocada automáticamente al cambiar o desmontar. */
export function useObjectUrl(blob: Blob | undefined | null): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}
