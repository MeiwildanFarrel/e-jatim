'use server'

import { redirect } from 'next/navigation'
import { createLoanApplication } from '@/lib/loanApplications/loanApplicationService'
import { DEFAULT_UMKM_ID, DEMO_KUR_REQUESTED_AMOUNT } from '@/lib/constants'

/**
 * Ajukan KUR — nominal tetap (DEMO_KUR_REQUESTED_AMOUNT), bukan input bebas,
 * konsisten dengan alur mock/PoC lainnya (consent, /masuk). Guard pengajuan
 * ganda ada di createLoanApplication() sendiri.
 */
export async function submitLoanApplication(formData: FormData) {
  const umkmId = (formData.get('umkm_id') as string | null) || DEFAULT_UMKM_ID

  await createLoanApplication(umkmId, DEMO_KUR_REQUESTED_AMOUNT)

  redirect(`/dashboard/ajukan-kur?umkm_id=${umkmId}`)
}
