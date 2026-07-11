import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

function generateReferenceNo(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(10, '0')
  return `${datePart}${seq}`
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ responseCode: '4001100', responseMessage: 'Invalid Field Format' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ responseCode: '4001100', responseMessage: 'Invalid Field Format' }, { status: 400 })
  }

  const { partnerReferenceNo, beneficiaryAccountNo } = body as Record<string, unknown>

  if (
    typeof partnerReferenceNo !== 'string' ||
    partnerReferenceNo.trim() === '' ||
    typeof beneficiaryAccountNo !== 'string' ||
    beneficiaryAccountNo.trim() === ''
  ) {
    return NextResponse.json({ responseCode: '4001100', responseMessage: 'Invalid Field Format' }, { status: 400 })
  }

  const { data: umkm, error } = await supabaseAdmin
    .from('umkm_profiles')
    .select('business_name')
    .eq('qris_merchant_id', beneficiaryAccountNo)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ responseCode: '5001100', responseMessage: error.message }, { status: 500 })
  }

  if (!umkm) {
    return NextResponse.json(
      { responseCode: '4041100', responseMessage: 'Account No Not Found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    responseCode: '2001100',
    responseMessage: 'Successful',
    referenceNo: generateReferenceNo(),
    partnerReferenceNo,
    accountNo: beneficiaryAccountNo,
    name: umkm.business_name,
    additionalInfo: {
      accountType: 'QRIS_MERCHANT',
      status: 'ACTIVE',
    },
  })
}
