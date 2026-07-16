import { BellIcon, PackageIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/design-system'

const swatches = [
  ['bg', 'bg-aura-bg border border-aura-border'],
  ['surface', 'bg-aura-surface border border-aura-border'],
  ['surface-2', 'bg-aura-surface-2'],
  ['accent', 'bg-aura-accent'],
  ['accent-soft', 'bg-aura-accent-soft'],
  ['destructive', 'bg-aura-destructive'],
  ['success', 'bg-aura-success'],
  ['warning', 'bg-aura-warning'],
] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-aura-faint text-sm font-semibold tracking-widest uppercase">{title}</h2>
      {children}
    </section>
  )
}

export function DesignPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-16">
      <header className="space-y-2">
        <Badge>Aura Design System</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          El lenguaje visual de <span className="text-aura-accent">Aura</span>
        </h1>
        <p className="text-aura-muted max-w-lg">
          Tokens, primitivas y patrones compartidos por todo el ecosistema. Cambia el tema con el
          botón de arriba a la derecha — todo responde.
        </p>
      </header>

      <Section title="Color">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {swatches.map(([name, cls]) => (
            <div key={name} className="space-y-1.5">
              <div className={`rounded-control shadow-aura-sm h-14 ${cls}`} />
              <p className="text-aura-muted text-center text-xs">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografía">
        <Card>
          <CardContent className="space-y-3">
            <p className="text-4xl font-semibold tracking-tight">Inter Variable</p>
            <p className="text-aura-muted text-lg">
              Titulares densos, cuerpo cómodo, números tabulares para precios.
            </p>
            <p className="font-mono text-sm tabular-nums">0123456789 · $12,499.00 MXN</p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <PlusIcon /> Agregar objeto
          </Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">
            <Trash2Icon /> Eliminar
          </Button>
          <Button size="icon" aria-label="Buscar">
            <SearchIcon />
          </Button>
          <Button size="sm" variant="secondary">
            Pequeño
          </Button>
          <Button size="lg">Grande</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Electrónica</Badge>
          <Badge variant="neutral">Sala</Badge>
          <Badge variant="outline">12 objetos</Badge>
          <Badge variant="success">En garantía</Badge>
          <Badge variant="warning">Garantía por vencer</Badge>
          <Badge variant="destructive">Prestado</Badge>
        </div>
      </Section>

      <Section title="Formulario">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Nuevo objeto</CardTitle>
            <CardDescription>Los campos usan Input, Label y Switch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="MacBook Pro 14”" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial">Número de serie</Label>
              <Input id="serial" placeholder="C02XL0GTJGH5" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fav">Marcar como favorito</Label>
              <Switch id="fav" />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() =>
                toast.success('Objeto guardado', { description: 'Demo del toast ADS' })
              }
            >
              Guardar
            </Button>
            <Button variant="ghost">Cancelar</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Glass">
        <div className="rounded-aura relative overflow-hidden p-8">
          <div className="from-aura-accent/50 via-aura-accent/20 to-aura-success/30 absolute inset-0 bg-gradient-to-br" />
          <div className="glass rounded-aura shadow-aura-md relative max-w-sm p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-control bg-aura-accent-soft text-aura-accent flex size-10 items-center justify-center">
                <PackageIcon className="size-5" />
              </div>
              <div>
                <p className="font-medium">Panel glass</p>
                <p className="text-aura-muted text-sm">blur {`{16px}`} sobre cualquier fondo</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="objetos">
          <TabsList>
            <TabsTrigger value="objetos">Objetos</TabsTrigger>
            <TabsTrigger value="habitaciones">Habitaciones</TabsTrigger>
            <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
          </TabsList>
          <TabsContent value="objetos" className="text-aura-muted text-sm">
            Aquí vivirá el grid del inventario.
          </TabsContent>
          <TabsContent value="habitaciones" className="text-aura-muted text-sm">
            Aquí vivirá el mapa inteligente.
          </TabsContent>
          <TabsContent value="etiquetas" className="text-aura-muted text-sm">
            Aquí vivirán las etiquetas.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Overlays">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar objeto?</DialogTitle>
                <DialogDescription>
                  Se moverá a la papelera. Podrás restaurarlo durante 30 días.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive">Eliminar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Abrir Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Detalle rápido</SheetTitle>
                <SheetDescription>
                  Los paneles laterales mostrarán filtros y fichas rápidas.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            onClick={() =>
              toast('Garantía por vencer', {
                description: 'La garantía de “Refrigerador LG” vence en 14 días.',
                icon: <BellIcon className="size-4" />,
              })
            }
          >
            Lanzar Toast
          </Button>
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="flex items-center gap-4">
          <Skeleton className="rounded-aura size-14" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </Section>
    </main>
  )
}
