import { AuraDatabase } from '@/data/db/AuraDatabase'
import { createContainer, type Container } from '@/application/container'

/** BD efímera + contenedor para tests (fake-indexeddb; un nombre único por test). */
export function createTestContainer(): { container: Container; db: AuraDatabase } {
  const db = new AuraDatabase(`test-${crypto.randomUUID()}`)
  return { container: createContainer(db), db }
}
