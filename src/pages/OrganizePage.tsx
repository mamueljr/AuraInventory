import { MapPinIcon } from 'lucide-react'
import { useCategories, useRooms, useTags } from '@/application/queries/use-catalog'
import { useCollections } from '@/application/queries/use-collections'
import { useCatalogActions, useLocations } from '@/application/queries/use-organize'
import type { Room } from '@/domain/entities'
import { Badge, Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system'
import {
  ConfirmDelete,
  ConfirmDeleteInline,
  EditableName,
  InlineAdd,
} from '@/features/organization/components/shared'

function RoomRow({ room }: { room: Room }) {
  const { data: locations } = useLocations(room.id)
  const actions = useCatalogActions()
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <EditableName
            name={room.name}
            onRename={(name) => actions.renameRoom.mutate([room.id, name])}
            className="font-medium"
          />
          <ConfirmDelete
            what={`la habitación “${room.name}”`}
            consequence="Sus objetos quedarán sin habitación asignada (no se borran) y sus ubicaciones desaparecerán."
            onConfirm={() => actions.deleteRoom.mutate([room.id])}
          />
        </div>
        {locations && locations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {locations.map((loc) => (
              <Badge key={loc.id} variant="neutral" className="gap-1.5">
                <MapPinIcon className="size-3" /> {loc.name}
                <button
                  type="button"
                  aria-label={`Eliminar ubicación ${loc.name}`}
                  onClick={() => actions.deleteLocation.mutate([loc.id])}
                  className="hover:text-aura-destructive -mr-0.5"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        <InlineAdd
          size="sm"
          placeholder="Nueva ubicación (cajón, estante…)"
          onAdd={(name) => actions.createLocation.mutate([room.id, name])}
        />
      </CardContent>
    </Card>
  )
}

function RoomsPanel() {
  const { data: rooms } = useRooms()
  const actions = useCatalogActions()
  return (
    <div className="space-y-3">
      <InlineAdd
        placeholder="Nueva habitación"
        onAdd={(name) => actions.createRoom.mutate([name])}
      />
      {rooms?.map((room) => (
        <RoomRow key={room.id} room={room} />
      ))}
    </div>
  )
}

function CategoriesPanel() {
  const { data: categories } = useCategories()
  const actions = useCatalogActions()
  const parents = categories?.filter((c) => !c.parentId) ?? []
  return (
    <div className="space-y-3">
      <InlineAdd
        placeholder="Nueva categoría"
        onAdd={(name) => actions.createCategory.mutate([name, undefined])}
      />
      {parents.map((parent) => {
        const children = categories?.filter((c) => c.parentId === parent.id) ?? []
        return (
          <Card key={parent.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <EditableName
                  name={parent.name}
                  onRename={(name) => actions.renameCategory.mutate([parent.id, name])}
                  className="font-medium"
                />
                <ConfirmDelete
                  what={`la categoría “${parent.name}”`}
                  consequence="También se eliminan sus subcategorías. Los objetos quedan sin categoría (no se borran)."
                  onConfirm={() => actions.deleteCategory.mutate([parent.id])}
                />
              </div>
              {children.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {children.map((sub) => (
                    <Badge key={sub.id} variant="outline" className="gap-1.5">
                      {sub.name}
                      <button
                        type="button"
                        aria-label={`Eliminar subcategoría ${sub.name}`}
                        onClick={() => actions.deleteCategory.mutate([sub.id])}
                        className="hover:text-aura-destructive -mr-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <InlineAdd
                size="sm"
                placeholder="Nueva subcategoría"
                onAdd={(name) => actions.createCategory.mutate([name, parent.id])}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ChipsPanel({
  items,
  placeholder,
  consequence,
  onAdd,
  onDelete,
}: {
  items: { id: string; name: string }[] | undefined
  placeholder: string
  consequence: string
  onAdd: (name: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <InlineAdd placeholder={placeholder} onAdd={onAdd} />
      <div className="flex flex-wrap gap-2">
        {items?.map((item) => (
          <span key={item.id} className="flex items-center">
            <Badge className="gap-1.5">
              {item.name}
              <ConfirmDeleteInline
                what={`“${item.name}”`}
                consequence={consequence}
                onConfirm={() => onDelete(item.id)}
              />
            </Badge>
          </span>
        ))}
        {items?.length === 0 && <p className="text-aura-faint text-sm">Aún no hay elementos.</p>}
      </div>
    </div>
  )
}

export function OrganizePage() {
  const { data: tags } = useTags()
  const { data: collections } = useCollections()
  const actions = useCatalogActions()

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Organizar</h1>
      <p className="text-aura-muted mb-6 text-sm">
        Habitaciones, categorías, etiquetas y colecciones. Borrar un catálogo nunca borra objetos.
      </p>
      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Habitaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="tags">Etiquetas</TabsTrigger>
          <TabsTrigger value="collections">Colecciones</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms">
          <RoomsPanel />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesPanel />
        </TabsContent>
        <TabsContent value="tags">
          <ChipsPanel
            items={tags}
            placeholder="Nueva etiqueta"
            consequence="La etiqueta se quitará de todos los objetos que la usan."
            onAdd={(name) => actions.createTag.mutate([name])}
            onDelete={(id) => actions.deleteTag.mutate([id])}
          />
        </TabsContent>
        <TabsContent value="collections">
          <ChipsPanel
            items={collections}
            placeholder="Nueva colección"
            consequence="La colección se quitará de todos los objetos que la incluyen."
            onAdd={(name) => actions.createCollection.mutate([name])}
            onDelete={(id) => actions.deleteCollection.mutate([id])}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
