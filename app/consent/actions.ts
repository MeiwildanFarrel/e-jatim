'use server'

import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import { saveCreditScore } from '@/lib/scoring/creditScoreService'
import { computeAndSaveStreak } from '@/lib/gamification/gamificationService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'

/**
 * Simpan pilihan consent (2 toggle terpisah, lihat ConsentForm.tsx) ke
 * consent_records, lalu langsung hitung ulang skor ACS dari ledger real
 * (saveCreditScore membaca consent_records yang baru saja ditulis untuk
 * menentukan apakah komponen Reputation ikut dihitung — lihat
 * creditScoreService.ts) DAN streak gamifikasi (salah satu dari 3 titik
 * pemicu resmi, lihat gamificationService.ts). Alur mock PoC, tanpa auth
 * sungguhan.
 */
export async function submitConsent(formData: FormData) {
  const umkmId = (formData.get('umkm_id') as string | null) || DEFAULT_UMKM_ID
  const transactionAccess = formData.get('transaction_data_access') === 'on'
  const marketplaceAccess = formData.get('marketplace_review_access') === 'on'

  // Guard sisi server (tombol "Lanjutkan" di UI sudah disable tanpa ini, tapi
  // consent adalah syarat hukum — jangan hanya diandalkan dari client).
  if (!transactionAccess) {
    throw new Error('Akses Data Transaksi wajib disetujui untuk melanjutkan.')
  }

  const now = new Date().toISOString()
  const { error } = await supabaseAdmin.from('consent_records').insert([
    {
      umkm_id: umkmId,
      consent_type: 'transaction_data_access',
      granted: transactionAccess,
      granted_at: now,
      revoked_at: null,
    },
    {
      umkm_id: umkmId,
      consent_type: 'marketplace_review_access',
      granted: marketplaceAccess,
      granted_at: marketplaceAccess ? now : null,
      revoked_at: null,
    },
  ])

  if (error) throw new Error(error.message)

  await Promise.all([saveCreditScore(umkmId), computeAndSaveStreak(umkmId)])

  redirect(`/dashboard?umkm_id=${umkmId}`)
}
