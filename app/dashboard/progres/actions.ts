'use server'

import { revalidatePath } from 'next/cache'
import { computeAndSaveStreak } from '@/lib/gamification/gamificationService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'

/** Tombol "Refresh" manual di tab Progres — satu dari 3 titik pemicu resmi
 * untuk hitung ulang streak (lihat catatan di gamificationService.ts). */
export async function refreshStreak(formData: FormData) {
  const umkmId = (formData.get('umkm_id') as string | null) || DEFAULT_UMKM_ID
  await computeAndSaveStreak(umkmId)
  revalidatePath('/dashboard/progres')
}
