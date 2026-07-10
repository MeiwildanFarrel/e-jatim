import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const ALLOWED_PLATFORMS = ['tokopedia', 'shopee', 'google_maps'] as const
const ALLOWED_SENTIMENTS = ['positif', 'netral', 'negatif'] as const

const REQUIRED_FIELDS = [
  'umkm_id',
  'platform',
  'review_text',
  'sentiment_label',
  'sentiment_confidence',
]

export async function GET() {
  return NextResponse.json({
    status: 'endpoint aktif',
    expected_method: 'POST',
    required_fields: REQUIRED_FIELDS,
  })
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

  const { umkm_id, platform, review_text, rating, sentiment_label, sentiment_confidence, review_date } =
    body as Record<string, unknown>

  if (typeof umkm_id !== 'string' || umkm_id.trim() === '') {
    return NextResponse.json(
      { error: "Field 'umkm_id' wajib diisi dan harus berupa string tidak kosong" },
      { status: 400 }
    )
  }

  if (typeof platform !== 'string' || !ALLOWED_PLATFORMS.includes(platform as (typeof ALLOWED_PLATFORMS)[number])) {
    return NextResponse.json(
      { error: `Field 'platform' wajib diisi dan harus salah satu dari: ${ALLOWED_PLATFORMS.join(', ')}` },
      { status: 400 }
    )
  }

  if (typeof review_text !== 'string' || review_text.trim() === '') {
    return NextResponse.json(
      { error: "Field 'review_text' wajib diisi dan tidak boleh kosong" },
      { status: 400 }
    )
  }

  if (
    typeof sentiment_label !== 'string' ||
    !ALLOWED_SENTIMENTS.includes(sentiment_label as (typeof ALLOWED_SENTIMENTS)[number])
  ) {
    return NextResponse.json(
      {
        error: `Field 'sentiment_label' wajib diisi dan harus persis salah satu dari: ${ALLOWED_SENTIMENTS.join(', ')} (huruf kecil semua)`,
      },
      { status: 400 }
    )
  }

  if (
    typeof sentiment_confidence !== 'number' ||
    Number.isNaN(sentiment_confidence) ||
    sentiment_confidence < 0 ||
    sentiment_confidence > 1
  ) {
    return NextResponse.json(
      {
        error: "Field 'sentiment_confidence' wajib diisi, berupa angka, dan nilainya antara 0 dan 1 inklusif (bukan persen 0-100)",
      },
      { status: 400 }
    )
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Field 'rating' kalau diisi harus berupa angka bulat antara 1 sampai 5" },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabaseAdmin
    .from('marketplace_reviews')
    .insert({
      umkm_id,
      platform,
      review_text: review_text.trim(),
      rating: rating ?? null,
      sentiment_label,
      sentiment_confidence,
      review_date: typeof review_date === 'string' ? review_date : new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
