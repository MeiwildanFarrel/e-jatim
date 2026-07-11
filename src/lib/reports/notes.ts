import { supabaseAdmin } from '@/lib/supabase/server'

export interface ReportNotes {
  totalTransactions: number
  classifiedTransactions: number
  needsTier3Count: number
  periodStart: string | null
  periodEnd: string | null
}

async function countTransactions(umkmId?: string, status?: string): Promise<number> {
  let query = supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true })
  if (umkmId) query = query.eq('umkm_id', umkmId)
  if (status) query = query.eq('classification_status', status)

  const { count, error } = await query
  if (error) throw new Error(error.message)
  return count ?? 0
}

async function getPeriodBoundary(umkmId: string | undefined, ascending: boolean): Promise<string | null> {
  let query = supabaseAdmin
    .from('transactions')
    .select('transaction_date')
    .order('transaction_date', { ascending })
    .limit(1)
  if (umkmId) query = query.eq('umkm_id', umkmId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data?.[0]?.transaction_date ?? null
}

/**
 * Metadata naratif untuk "Catatan atas Laporan Keuangan" — jujur soal
 * transaksi yang belum masuk laporan (needs_tier3), bukan cuma angka trial
 * balance yang sudah rapi.
 */
export async function getReportNotes(umkmId?: string): Promise<ReportNotes> {
  const [totalTransactions, needsTier3Count, classifiedTransactions, periodStart, periodEnd] = await Promise.all([
    countTransactions(umkmId),
    countTransactions(umkmId, 'needs_tier3'),
    countTransactions(umkmId, 'classified'),
    getPeriodBoundary(umkmId, true),
    getPeriodBoundary(umkmId, false),
  ])

  return { totalTransactions, classifiedTransactions, needsTier3Count, periodStart, periodEnd }
}
