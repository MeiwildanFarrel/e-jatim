export type JournalType = 'kas_masuk' | 'kas_keluar' | 'umum'

export interface ClassificationRule {
  pattern: RegExp
  categoryAccountCode: string   // akun lawan dari akun Kas/Bank
  categoryAccountName: string   // buat keperluan log/debug saja
  journalType: JournalType
  requiredType?: 'in' | 'out'
  isTransfer?: boolean
  transferDebitAccount?: string
  transferCreditAccount?: string
}

// Urutan penting: pola lebih spesifik ditaruh duluan
export const classificationRules: ClassificationRule[] = [
  // ============ TRANSFER ANTAR KAS/BANK (jurnal umum, bukan pendapatan/beban) ============
  { pattern: /tarik tunai|withdraw|cairkan/i, categoryAccountCode: '', categoryAccountName: 'Transfer', journalType: 'umum', isTransfer: true, transferDebitAccount: '101', transferCreditAccount: '102' },
  { pattern: /setor tunai|\bdeposit\b/i, categoryAccountCode: '', categoryAccountName: 'Transfer', journalType: 'umum', isTransfer: true, transferDebitAccount: '102', transferCreditAccount: '101' },

  // ============ PENDAPATAN (transaction_type = 'in') ============
  { pattern: /pembayaran qris.*penjualan/i, categoryAccountCode: '400', categoryAccountName: 'Pendapatan Penjualan', journalType: 'kas_masuk' },
  { pattern: /pesanan catering|catering/i, categoryAccountCode: '400', categoryAccountName: 'Pendapatan Penjualan', journalType: 'kas_masuk' },
  { pattern: /gofood|grabfood|shopeefood/i, categoryAccountCode: '400', categoryAccountName: 'Pendapatan Penjualan', journalType: 'kas_masuk' },
  { pattern: /pesanan online|orderan|order/i, categoryAccountCode: '400', categoryAccountName: 'Pendapatan Penjualan', journalType: 'kas_masuk' },
  { pattern: /penjualan|terjual|\bjual\b/i, categoryAccountCode: '400', categoryAccountName: 'Pendapatan Penjualan', journalType: 'kas_masuk' },
  { pattern: /\bdp\b|uang muka|panjar/i, categoryAccountCode: '220', categoryAccountName: 'Pendapatan Diterima Dimuka', journalType: 'kas_masuk' },
  { pattern: /qris/i, categoryAccountCode: '400', categoryAccountName: 'Pendapatan Penjualan', journalType: 'kas_masuk', requiredType: 'in' },
  { pattern: /transfer masuk|terima transfer/i, categoryAccountCode: '401', categoryAccountName: 'Pendapatan Lain-lain', journalType: 'kas_masuk', requiredType: 'in' },

  // ============ MODAL & PINJAMAN (transaction_type = 'in') ============
  { pattern: /setor modal|tambah modal|injeksi modal|modal awal|modal usaha/i, categoryAccountCode: '301', categoryAccountName: 'Modal Pemilik', journalType: 'kas_masuk' },
  { pattern: /pinjaman|kredit modal|\bkur\b/i, categoryAccountCode: '210', categoryAccountName: 'Utang Bank/KUR', journalType: 'kas_masuk' },

  // ============ BEBAN (transaction_type = 'out') ============
  { pattern: /beli bahan baku|bahan baku|belanja bahan/i, categoryAccountCode: '630', categoryAccountName: 'Beban Bahan Baku', journalType: 'kas_keluar' },
  { pattern: /beli sayur|beli daging|beli ayam|beli ikan|beli beras|beli telur|beli bumbu/i, categoryAccountCode: '630', categoryAccountName: 'Beban Bahan Baku', journalType: 'kas_keluar' },
  { pattern: /kulakan|restock|stok barang/i, categoryAccountCode: '630', categoryAccountName: 'Beban Bahan Baku', journalType: 'kas_keluar' },
  { pattern: /gas|lpg|isi gas/i, categoryAccountCode: '631', categoryAccountName: 'Beban Utilitas', journalType: 'kas_keluar' },
  { pattern: /listrik|token listrik|\bpln\b/i, categoryAccountCode: '631', categoryAccountName: 'Beban Utilitas', journalType: 'kas_keluar' },
  { pattern: /\bair\b|pdam/i, categoryAccountCode: '631', categoryAccountName: 'Beban Utilitas', journalType: 'kas_keluar' },
  { pattern: /pulsa|paket data|internet|wifi/i, categoryAccountCode: '631', categoryAccountName: 'Beban Utilitas', journalType: 'kas_keluar' },
  { pattern: /gaji|upah|bayar karyawan|honor/i, categoryAccountCode: '632', categoryAccountName: 'Beban Gaji/Upah', journalType: 'kas_keluar' },
  { pattern: /sewa tempat|sewa kios|\bsewa\b/i, categoryAccountCode: '633', categoryAccountName: 'Beban Sewa', journalType: 'kas_keluar' },
  { pattern: /packaging|kemasan|beli plastik|beli box|beli kardus/i, categoryAccountCode: '634', categoryAccountName: 'Beban Kemasan', journalType: 'kas_keluar' },
  { pattern: /transport|bensin|ongkir|ojek/i, categoryAccountCode: '635', categoryAccountName: 'Beban Transportasi', journalType: 'kas_keluar' },
  { pattern: /retribusi|pajak|iuran/i, categoryAccountCode: '636', categoryAccountName: 'Beban Administrasi & Pajak', journalType: 'kas_keluar' },
  { pattern: /service|perbaikan|maintenance/i, categoryAccountCode: '637', categoryAccountName: 'Beban Pemeliharaan', journalType: 'kas_keluar' },

  // ============ ASET (transaction_type = 'out', tapi bukan beban — jadi aset) ============
  { pattern: /beli peralatan|beli alat masak|beli mesin|beli kompor/i, categoryAccountCode: '130', categoryAccountName: 'Peralatan', journalType: 'kas_keluar' },
  { pattern: /beli perlengkapan/i, categoryAccountCode: '120', categoryAccountName: 'Perlengkapan', journalType: 'kas_keluar' },

  // ============ PRIVE (transaction_type = 'out') ============
  { pattern: /prive|tarik untuk pribadi|ambil untuk pribadi|keperluan pribadi/i, categoryAccountCode: '302', categoryAccountName: 'Prive (Penarikan Pemilik)', journalType: 'kas_keluar' },
]

/**
 * Menentukan akun "uang" (Kas/Bank) berdasarkan sumber transaksi.
 * Sumber digital (QRIS/e-wallet) dianggap masuk ke akun Bank/E-wallet,
 * bukan Kas fisik.
 */
export function resolveMoneyAccount(source: string): string {
  const digitalSources = ['qris', 'gopay', 'ovo', 'dana', 'tokopedia', 'shopee', 'shopeefood', 'gofood', 'grabfood']
  return digitalSources.includes(source.toLowerCase()) ? '102' : '101'
}