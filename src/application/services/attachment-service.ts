import type { Attachment, AttachmentKind } from '@/domain/entities'
import type { AttachmentRepository, ItemRepository } from '@/domain/repositories'
import { newId, nowIso } from '@/utils/ids'

const MAX_SIZE_MB = 20
const ALLOWED = ['application/pdf', 'image/']

interface AttachmentServiceDeps {
  items: ItemRepository
  attachments: AttachmentRepository
}

/** Facturas, manuales y otros documentos del Pasaporte Digital. */
export class AttachmentService {
  private readonly deps: AttachmentServiceDeps

  constructor(deps: AttachmentServiceDeps) {
    this.deps = deps
  }

  async add(itemId: string, file: File, kind: AttachmentKind): Promise<Attachment> {
    const item = await this.deps.items.getById(itemId)
    if (!item || item.deletedAt) throw new Error(`No existe el objeto ${itemId}`)
    if (!ALLOWED.some((t) => file.type.startsWith(t)))
      throw new Error('Solo se admiten PDF o imágenes')
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      throw new Error(`El archivo supera ${MAX_SIZE_MB} MB`)

    const attachment: Attachment = {
      id: newId(),
      itemId,
      kind,
      name: file.name,
      mimeType: file.type,
      blob: file,
      size: file.size,
      createdAt: nowIso(),
    }
    await this.deps.attachments.put(attachment)
    return attachment
  }

  async remove(id: string): Promise<void> {
    await this.deps.attachments.delete(id)
  }
}
