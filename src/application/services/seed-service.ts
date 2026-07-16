import type { Category, Room, Tag } from '@/domain/entities'
import type { Container } from '@/application/container'
import { newId } from '@/utils/ids'

const ROOMS = ['Sala', 'Cocina', 'Recámara', 'Oficina', 'Cochera']
const CATEGORIES: Record<string, string[]> = {
  Electrónica: ['Cómputo', 'Audio', 'Video'],
  Muebles: ['Sala', 'Recámara'],
  Herramientas: ['Manuales', 'Eléctricas'],
  Libros: [],
  Vehículos: [],
}
const TAGS = ['premium', 'trabajo', 'urgente-revisar', 'heredado']

const DEMO_ITEMS: { name: string; brand?: string; price?: number; cat: string; room: string }[] = [
  { name: 'MacBook Pro 14"', brand: 'Apple', price: 45999, cat: 'Cómputo', room: 'Oficina' },
  { name: 'Monitor 27" 4K', brand: 'LG', price: 8999, cat: 'Cómputo', room: 'Oficina' },
  { name: 'Bocina HomePod mini', brand: 'Apple', price: 2499, cat: 'Audio', room: 'Sala' },
  { name: 'Smart TV 55"', brand: 'Samsung', price: 12999, cat: 'Video', room: 'Sala' },
  { name: 'Sofá 3 plazas', price: 15999, cat: 'Sala', room: 'Sala' },
  { name: 'Colchón queen', price: 9999, cat: 'Recámara', room: 'Recámara' },
  { name: 'Taladro inalámbrico', brand: 'DeWalt', price: 3299, cat: 'Eléctricas', room: 'Cochera' },
  { name: 'Juego de desarmadores', price: 599, cat: 'Manuales', room: 'Cochera' },
  { name: 'Refrigerador', brand: 'LG', price: 18999, cat: 'Electrónica', room: 'Cocina' },
  {
    name: 'Cafetera espresso',
    brand: 'De’Longhi',
    price: 4599,
    cat: 'Electrónica',
    room: 'Cocina',
  },
]

/**
 * Datos de demostración para desarrollo. Idempotente:
 * no hace nada si la base ya tiene objetos.
 */
export async function seedDemoData(container: Container): Promise<boolean> {
  const { repos, itemService } = container
  if ((await repos.items.countActive()) > 0) return false

  const rooms: Room[] = ROOMS.map((name, order) => ({ id: newId(), name, order }))
  await repos.rooms.bulkPut(rooms)

  const categories: Category[] = []
  for (const [parent, children] of Object.entries(CATEGORIES)) {
    const parentCat = { id: newId(), name: parent }
    categories.push(
      parentCat,
      ...children.map((name) => ({ id: newId(), name, parentId: parentCat.id })),
    )
  }
  await repos.categories.bulkPut(categories)

  const tags: Tag[] = TAGS.map((name) => ({ id: newId(), name }))
  await repos.tags.bulkPut(tags)

  const byName = (name: string) => categories.find((c) => c.name === name)
  const roomByName = (name: string) => rooms.find((r) => r.name === name)

  for (const [i, demo] of DEMO_ITEMS.entries()) {
    const category = byName(demo.cat)
    await itemService.create({
      name: demo.name,
      brand: demo.brand,
      purchasePrice: demo.price,
      currency: demo.price ? 'MXN' : undefined,
      categoryId: category?.parentId ?? category?.id,
      subcategoryId: category?.parentId ? category.id : undefined,
      roomId: roomByName(demo.room)?.id,
      tagIds: i % 3 === 0 ? [tags[i % tags.length].id] : [],
      favorite: i % 4 === 0,
    })
  }
  return true
}
