export function formatCurrency(value: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(iso))
}
