import { NextResponse } from 'next/server'

interface TransactionDetail {
  amount: { value: string; currency: string }
  transactionDate: string
  remark: string
  transactionId: string
  type: 'Credit' | 'Debit'
}

const REMARK_POOL: { remark: string; type: 'Credit' | 'Debit' }[] = [
  { remark: 'Pembayaran QRIS - Penjualan harian', type: 'Credit' },
  { remark: 'Pesanan online catering', type: 'Credit' },
  { remark: 'Beli bahan baku sayur dan daging', type: 'Debit' },
  { remark: 'Beli gas LPG', type: 'Debit' },
]

function generateReferenceNo(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(10, '0')
  return `${datePart}${seq}`
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 1000) * 1000
}

function formatAmount(value: number): string {
  return value.toFixed(2)
}

function sumAmount(entries: TransactionDetail[]): number {
  return entries.reduce((sum, entry) => sum + Number(entry.amount.value), 0)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ responseCode: '4001400', responseMessage: 'Invalid Field Format' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ responseCode: '4001400', responseMessage: 'Invalid Field Format' }, { status: 400 })
  }

  const { accountNo, fromDateTime, toDateTime } = body as Record<string, unknown>

  if (
    typeof accountNo !== 'string' ||
    accountNo.trim() === '' ||
    typeof fromDateTime !== 'string' ||
    Number.isNaN(Date.parse(fromDateTime)) ||
    typeof toDateTime !== 'string' ||
    Number.isNaN(Date.parse(toDateTime))
  ) {
    return NextResponse.json({ responseCode: '4001400', responseMessage: 'Invalid Field Format' }, { status: 400 })
  }

  const fromMs = Date.parse(fromDateTime)
  const toMs = Date.parse(toDateTime)
  const spanMs = Math.max(toMs - fromMs, 1)

  const detailData: TransactionDetail[] = REMARK_POOL.map((entry, index) => {
    const txDate = new Date(fromMs + Math.floor((spanMs / REMARK_POOL.length) * index) + 3_600_000)
    const amount = entry.type === 'Credit' ? randomAmount(1_500_000, 4_500_000) : randomAmount(150_000, 500_000)
    return {
      amount: { value: formatAmount(amount), currency: 'IDR' },
      transactionDate: txDate.toISOString(),
      remark: entry.remark,
      transactionId: `TRX-MOCK-${String(index + 1).padStart(4, '0')}`,
      type: entry.type,
    }
  })

  const creditEntries = detailData.filter((entry) => entry.type === 'Credit')
  const debitEntries = detailData.filter((entry) => entry.type === 'Debit')

  return NextResponse.json({
    responseCode: '2001400',
    responseMessage: 'Successful',
    referenceNo: generateReferenceNo(),
    totalCreditEntries: {
      numberOfEntries: String(creditEntries.length),
      amount: { value: formatAmount(sumAmount(creditEntries)), currency: 'IDR' },
    },
    totalDebitEntries: {
      numberOfEntries: String(debitEntries.length),
      amount: { value: formatAmount(sumAmount(debitEntries)), currency: 'IDR' },
    },
    detailData,
  })
}
