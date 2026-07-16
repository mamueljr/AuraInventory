import { HeartIcon, XIcon } from 'lucide-react'
import { useCategories, useRooms, useTags } from '@/application/queries/use-catalog'
import { useCollections } from '@/application/queries/use-collections'
import { isFilterActive } from '@/domain/inventory-filter'
import { Button, NativeSelect, cn } from '@/design-system'
import { FILTER_KEYS, useInventoryFilter } from '@/features/inventory/hooks/use-inventory-filter'

export function FilterBar() {
  const [filter, update] = useInventoryFilter()
  const { data: rooms } = useRooms()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const { data: collections } = useCollections()

  const select = (
    key: string,
    value: string | undefined,
    placeholder: string,
    options: { id: string; name: string }[] | undefined,
  ) => (
    <NativeSelect
      aria-label={placeholder}
      value={value ?? ''}
      onChange={(e) => update({ [key]: e.target.value })}
      className={cn('h-8 w-auto pr-8 text-xs', value && 'border-aura-accent text-aura-accent')}
    >
      <option value="">{placeholder}</option>
      {options?.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </NativeSelect>
  )

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {select('room', filter.roomId, 'Habitación', rooms)}
      {select(
        'category',
        filter.categoryId,
        'Categoría',
        categories?.map((c) => ({
          id: c.id,
          name: c.parentId ? `— ${c.name}` : c.name,
        })),
      )}
      {select('tag', filter.tagId, 'Etiqueta', tags)}
      {select('collection', filter.collectionId, 'Colección', collections)}
      <Button
        size="sm"
        variant={filter.favoritesOnly ? 'primary' : 'outline'}
        aria-pressed={filter.favoritesOnly}
        onClick={() => update({ fav: filter.favoritesOnly ? '' : '1' })}
      >
        <HeartIcon className={cn(filter.favoritesOnly && 'fill-current')} /> Favoritos
      </Button>
      {isFilterActive(filter) && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])))}
        >
          <XIcon /> Limpiar
        </Button>
      )}
    </div>
  )
}
