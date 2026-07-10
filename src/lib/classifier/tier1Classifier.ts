import { classificationRules, resolveMoneyAccount, JournalType } from './regexRules'

export interface LedgerEntryDraft {
  account_code: string
  entry_side: 'debit' | 'credit'
  journal_type: JournalType
}

export interface ClassificationResult {
  matched: boolean
  entries: LedgerEntryDraft[] | null
}

/**
 * Klasifikasi transaksi ke SEPASANG entry double-entry (debit + kredit).
 * Tier 1 — regex, bukan AI.
 */
export function classifyTransaction(
  text: string,
  transactionType: 'in' | 'out',
  source: string
): ClassificationResult {
  for (const rule of classificationRules) {
    if (rule.requiredType && rule.requiredType !== transactionType) continue
    if (!rule.pattern.test(text)) continue

    // Kasus transfer antar Kas/Bank (bukan pendapatan/beban)
    if (rule.isTransfer) {
      return {
        matched: true,
        entries: [
          { account_code: rule.transferDebitAccount!, entry_side: 'debit', journal_type: rule.journalType },
          { account_code: rule.transferCreditAccount!, entry_side: 'credit', journal_type: rule.journalType },
        ],
      }
    }

    const moneyAccount = resolveMoneyAccount(source)

    // Uang masuk: debit akun uang, kredit akun kategori (pendapatan/modal/utang)
    if (transactionType === 'in') {
      return {
        matched: true,
        entries: [
          { account_code: moneyAccount, entry_side: 'debit', journal_type: rule.journalType },
          { account_code: rule.categoryAccountCode, entry_side: 'credit', journal_type: rule.journalType },
        ],
      }
    }

    // Uang keluar: debit akun kategori (beban/aset/prive), kredit akun uang
    return {
      matched: true,
      entries: [
        { account_code: rule.categoryAccountCode, entry_side: 'debit', journal_type: rule.journalType },
        { account_code: moneyAccount, entry_side: 'credit', journal_type: rule.journalType },
      ],
    }
  }

  // Nggak ada yang cocok — dilempar ke Tier 2 (IndoBERT)
  return { matched: false, entries: null }
}