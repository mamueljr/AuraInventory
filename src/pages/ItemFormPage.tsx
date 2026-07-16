import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCategories, useRooms, useTags } from '@/application/queries/use-catalog'
import { useCreateItemWithPhotos, useItem, useUpdateItem } from '@/application/queries/use-items'
import { useAddPhotos } from '@/application/queries/use-photos'
import type { Item, ItemDraft } from '@/domain/entities'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  NativeSelect,
  Switch,
  Textarea,
  cn,
} from '@/design-system'
import { PhotoPicker } from '@/features/inventory/components/PhotoPicker'
import { PhotoManager } from '@/features/inventory/components/PhotoManager'

const STEPS = ['Básico', 'Detalles', 'Compra', 'Fotos'] as const

const CONDITIONS = [
  ['new', 'Nuevo'],
  ['like-new', 'Como nuevo'],
  ['good', 'Bueno'],
  ['fair', 'Regular'],
  ['poor', 'Malo'],
  ['broken', 'Descompuesto'],
] as const

interface FormState {
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  roomId: string
  quantity: string
  brand: string
  model: string
  color: string
  condition: string
  serialNumber: string
  notes: string
  tagIds: string[]
  favorite: boolean
  purchasePrice: string
  currency: string
  currentValue: string
  purchaseDate: string
  purchasePlace: string
  supplier: string
  warrantyUntil: string
}

const EMPTY: FormState = {
  name: '',
  description: '',
  categoryId: '',
  subcategoryId: '',
  roomId: '',
  quantity: '1',
  brand: '',
  model: '',
  color: '',
  condition: '',
  serialNumber: '',
  notes: '',
  tagIds: [],
  favorite: false,
  purchasePrice: '',
  currency: 'MXN',
  currentValue: '',
  purchaseDate: '',
  purchasePlace: '',
  supplier: '',
  warrantyUntil: '',
}

function toDraft(f: FormState): ItemDraft {
  const opt = (s: string) => (s.trim() ? s.trim() : undefined)
  const num = (s: string) => (s.trim() ? Number(s) : undefined)
  return {
    name: f.name,
    description: opt(f.description),
    categoryId: opt(f.categoryId),
    subcategoryId: opt(f.subcategoryId),
    roomId: opt(f.roomId),
    quantity: Number(f.quantity) || 1,
    brand: opt(f.brand),
    model: opt(f.model),
    color: opt(f.color),
    condition: (opt(f.condition) as ItemDraft['condition']) ?? undefined,
    serialNumber: opt(f.serialNumber),
    notes: opt(f.notes),
    tagIds: f.tagIds,
    favorite: f.favorite,
    purchasePrice: num(f.purchasePrice),
    currency: opt(f.currency),
    currentValue: num(f.currentValue),
    purchaseDate: opt(f.purchaseDate),
    purchasePlace: opt(f.purchasePlace),
    supplier: opt(f.supplier),
    warrantyUntil: opt(f.warrantyUntil),
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function fromItem(item: Item): FormState {
  return {
    ...EMPTY,
    ...(Object.fromEntries(
      Object.entries({
        name: item.name,
        description: item.description,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId,
        roomId: item.roomId,
        brand: item.brand,
        model: item.model,
        color: item.color,
        condition: item.condition,
        serialNumber: item.serialNumber,
        notes: item.notes,
        purchasePlace: item.purchasePlace,
        supplier: item.supplier,
        purchaseDate: item.purchaseDate,
        warrantyUntil: item.warrantyUntil,
        currency: item.currency ?? 'MXN',
      }).map(([k, v]) => [k, v ?? '']),
    ) as Partial<FormState>),
    quantity: String(item.quantity),
    purchasePrice: item.purchasePrice?.toString() ?? '',
    currentValue: item.currentValue?.toString() ?? '',
    tagIds: item.tagIds,
    favorite: item.favorite,
  }
}

export function ItemFormPage() {
  const { id } = useParams()
  const { data: existing, isPending } = useItem(id ?? '')

  // El formulario se remonta por key: el prefill llega como estado inicial, sin efectos.
  if (id && isPending) return null
  return <ItemForm key={id ?? 'new'} itemId={id} initial={existing ? fromItem(existing) : EMPTY} />
}

function ItemForm({ itemId, initial }: { itemId?: string; initial: FormState }) {
  const id = itemId
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: rooms } = useRooms()
  const { data: categories } = useCategories()
  const { data: tags } = useTags()

  const createItem = useCreateItemWithPhotos()
  const updateItem = useUpdateItem()
  const addPhotos = useAddPhotos(id ?? '')

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initial)
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const parentCategories = categories?.filter((c) => !c.parentId) ?? []
  const subcategories = categories?.filter((c) => c.parentId === form.categoryId) ?? []

  async function save() {
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateItem.mutateAsync({ id, patch: toDraft(form) })
        if (files.length) await addPhotos.mutateAsync(files)
        toast.success('Cambios guardados')
        navigate(`/items/${id}`)
      } else {
        const item = await createItem.mutateAsync({ draft: toDraft(form), files })
        toast.success(`“${item.name}” registrado`)
        navigate(`/items/${item.id}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const canNext = step === 0 ? form.name.trim().length > 0 : true
  const isLast = step === STEPS.length - 1

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        {isEdit ? 'Editar objeto' : 'Nuevo objeto'}
      </h1>

      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn(
                'h-1 rounded-full transition-colors',
                i <= step ? 'bg-aura-accent' : 'bg-aura-surface-2',
              )}
            />
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                'text-left text-xs font-medium',
                i === step ? 'text-aura-accent' : 'text-aura-faint',
                i < step && 'hover:text-aura-fg cursor-pointer',
              )}
            >
              {label}
            </button>
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="animate-aura-in space-y-4" key={step}>
          {step === 0 && (
            <>
              <Field label="Nombre *">
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="MacBook Pro 14”"
                  autoFocus
                />
              </Field>
              <Field label="Descripción">
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="¿Qué es y para qué lo usas?"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoría">
                  <NativeSelect
                    value={form.categoryId}
                    onChange={(e) => {
                      set('categoryId', e.target.value)
                      set('subcategoryId', '')
                    }}
                  >
                    <option value="">Sin categoría</option>
                    {parentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Subcategoría">
                  <NativeSelect
                    value={form.subcategoryId}
                    onChange={(e) => set('subcategoryId', e.target.value)}
                    disabled={subcategories.length === 0}
                  >
                    <option value="">—</option>
                    {subcategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Habitación">
                  <NativeSelect value={form.roomId} onChange={(e) => set('roomId', e.target.value)}>
                    <option value="">Sin asignar</option>
                    {rooms?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Cantidad">
                  <Input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => set('quantity', e.target.value)}
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="fav">Marcar como favorito</Label>
                <Switch
                  id="fav"
                  checked={form.favorite}
                  onCheckedChange={(v) => set('favorite', v)}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca">
                  <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} />
                </Field>
                <Field label="Modelo">
                  <Input value={form.model} onChange={(e) => set('model', e.target.value)} />
                </Field>
                <Field label="Color">
                  <Input value={form.color} onChange={(e) => set('color', e.target.value)} />
                </Field>
                <Field label="Estado">
                  <NativeSelect
                    value={form.condition}
                    onChange={(e) => set('condition', e.target.value)}
                  >
                    <option value="">—</option>
                    {CONDITIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
              <Field label="Número de serie">
                <Input
                  value={form.serialNumber}
                  onChange={(e) => set('serialNumber', e.target.value)}
                  placeholder="C02XL0GTJGH5"
                />
              </Field>
              {tags && tags.length > 0 && (
                <Field label="Etiquetas">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const active = form.tagIds.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            set(
                              'tagIds',
                              active
                                ? form.tagIds.filter((t) => t !== tag.id)
                                : [...form.tagIds, tag.id],
                            )
                          }
                        >
                          <Badge variant={active ? 'accent' : 'outline'}>
                            {active && <CheckIcon />} {tag.name}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </Field>
              )}
              <Field label="Notas">
                <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio de compra">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) => set('purchasePrice', e.target.value)}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Moneda">
                  <NativeSelect
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value)}
                  >
                    {['MXN', 'USD', 'EUR'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Fecha de compra">
                  <Input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => set('purchaseDate', e.target.value)}
                  />
                </Field>
                <Field label="Valor actual">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.currentValue}
                    onChange={(e) => set('currentValue', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Lugar de compra">
                <Input
                  value={form.purchasePlace}
                  onChange={(e) => set('purchasePlace', e.target.value)}
                  placeholder="Amazon, Liverpool…"
                />
              </Field>
              <Field label="Proveedor">
                <Input value={form.supplier} onChange={(e) => set('supplier', e.target.value)} />
              </Field>
              <Field label="Garantía hasta">
                <Input
                  type="date"
                  value={form.warrantyUntil}
                  onChange={(e) => set('warrantyUntil', e.target.value)}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              {isEdit && id && <PhotoManager itemId={id} />}
              <PhotoPicker files={files} onChange={setFiles} />
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
          disabled={saving}
        >
          <ArrowLeftIcon /> {step === 0 ? 'Cancelar' : 'Atrás'}
        </Button>
        {isLast ? (
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            <CheckIcon /> {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        ) : (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
            Siguiente <ArrowRightIcon />
          </Button>
        )}
      </div>
    </main>
  )
}
