export function formatRupiah(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  const formatted = Math.abs(Math.round(amount)).toLocaleString('id-ID')
  return `${sign}Rp${formatted}`
}

export function formatDateID(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
