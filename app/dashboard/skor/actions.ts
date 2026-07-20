'use server'

import { revalidatePath } from 'next/cache'
import { saveCreditScore } from '@/lib/scoring/creditScoreService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'

/** Tombol "Refresh" manual di tab Skor Kredit — hitung ulang ACS dari
 * ledger terkini tanpa harus mengulang alur consent. */
export async function refreshCreditScore(formData: FormData) {
  const umkmId = (formData.get('umkm_id') as string | null) || DEFAULT_UMKM_ID
  await saveCreditScore(umkmId)
  revalidatePath('/dashboard/skor')
  revalidatePath('/dashboard')
}
