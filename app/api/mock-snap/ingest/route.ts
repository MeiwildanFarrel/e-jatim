import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface TransactionDetail {
  amount: { value: string; currency: string }
  transactionDate: string
  remark: string
  transactionId: string
  type: 'Credit' | 'Debit'
}

interface TransactionHistoryResponse {
  responseCode: string
  responseMessage: string
  detailData?: TransactionDetail[]
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body harus berupa JSON yang valid' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body harus berupa JSON object' }, { status: 400 })
  }

  const { umkm_id, accountNo } = body as Record<string, unknown>

  if (typeof umkm_id !== 'string' || umkm_id.trim() === '') {
    return NextResponse.json({ error: "Field 'umkm_id' wajib diisi dan berupa string tidak kosong" }, { status: 400 })
  }

  if (typeof accountNo !== 'string' || accountNo.trim() === '') {
    return NextResponse.json({ error: "Field 'accountNo' wajib diisi dan berupa string tidak kosong" }, { status: 400 })
  }

  // Simulasi tarikan malam hari: ambil transaksi 24 jam terakhir.
  const toDateTime = new Date()
  const fromDateTime = new Date(toDateTime.getTime() - 24 * 60 * 60 * 1000)

  const origin = new URL(request.url).origin
  const historyResponse = await fetch(`${origin}/api/mock-snap/transaction-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountNo,
      fromDateTime: fromDateTime.toISOString(),
      toDateTime: toDateTime.toISOString(),
    }),
  })

  const historyData = (await historyResponse.json()) as TransactionHistoryResponse

  if (!historyResponse.ok || historyData.responseCode !== '2001400' || !historyData.detailData) {
    return NextResponse.json(
      { error: 'Gagal mengambil transaction-history dari mock SNAP', detail: historyData },
      { status: 502 }
    )
  }

  const rows = historyData.detailData.map((detail) => ({
    umkm_id,
    source: 'qris',
    amount: Number(detail.amount.value),
    transaction_type: detail.type === 'Credit' ? 'in' : 'out',
    raw_description: detail.remark,
    transaction_date: detail.transactionDate,
    classification_status: 'pending',
  }))

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('transactions')
    .insert(rows)
    .select()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    status: 'ok',
    umkm_id,
    accountNo,
    period: { fromDateTime: fromDateTime.toISOString(), toDateTime: toDateTime.toISOString() },
    fetched: historyData.detailData.length,
    inserted: inserted?.length ?? 0,
    transactions: inserted,
  })
}
