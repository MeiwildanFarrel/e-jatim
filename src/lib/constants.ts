// PoC: satu-satunya UMKM dengan data saat ini (Nasi Campur Bu Sari). Dipakai
// sebagai fallback default di beberapa tempat (dashboard, consent, scoring)
// saat ?umkm_id= tidak diberikan di URL/form.
export const DEFAULT_UMKM_ID = '71d869df-7a97-4d29-af8c-40bc55f895bf'

// Persona demo "Pak Arief" (Bab 3 proposal, user INTERNAL Bank Jatim, lihat
// PRD.md §6) — LABEL TAMPILAN saja, bukan disimpan ke DB. ⚠️ Ditemukan saat
// implementasi (14 Juli): `loan_applications.bank_analyst_id` ternyata PUNYA
// FK constraint nyata (`loan_applications_bank_analyst_id_fkey`) ke
// `auth.users` — BUKAN kolom uuid bebas seperti dugaan awal PRD.md §4.1.
// UUID dummy hardcode gagal (FK violation) karena tidak ada baris auth.users
// yang cocok, dan membuat akun auth sungguhan untuk persona demo di luar
// instruksi eksplisit ("hardcode 1 UUID dummy"). Solusinya: `bank_analyst_id`
// disimpan NULL (tidak melanggar FK), nama "Pak Arief" tetap tampil di UI
// sebagai label statis lewat konstanta ini, terpisah dari data yang disimpan.
export const DEMO_BANK_ANALYST_NAME = 'Pak Arief (demo)'

// Nominal representatif untuk pengajuan KUR modal kerja skala mikro — dipilih
// proporsional terhadap skala usaha Bu Sari (total pendapatan tercatat
// ~Rp340 juta selama ~3,5 bulan data, sekitar Rp95 juta/bulan), BUKAN diklaim
// sebagai angka plafon resmi KUR tertentu. Untuk PoC, nominal ini tetap
// (bukan input bebas user) supaya alur "Ajukan KUR" tetap sesederhana satu
// tombol, konsisten dengan keputusan mock/PoC lainnya.
export const DEMO_KUR_REQUESTED_AMOUNT = 15_000_000
