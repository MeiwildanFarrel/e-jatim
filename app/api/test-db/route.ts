import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('umkm_profiles')
    .select('*')
    .limit(1)

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'connected', rowCount: data.length })
}