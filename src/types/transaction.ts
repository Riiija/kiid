export type TransactionType = 'credit' | 'debit' | 'reward' | 'adjustment' | 'saving'

export type KidTransaction = {
  id: string
  childId: string
  amount: number
  type: TransactionType
  description: string
  createdAt: string
  createdBy: string
  balanceAfter: number
}

export type TransactionFiltersState = {
  childId: string
  type: string
  period: string
  search: string
}
