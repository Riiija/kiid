import type { KidTransaction, TransactionType } from '../../../types/transaction'
import { requireSupabaseClient, supabase } from '../../../lib/supabase'
import { listMockTransactions, recordMockTransaction } from '../../../mocks/mockRuntimeStore'
import { throwFrenchError } from '../../../utils/errors'

type TransactionRow = {
  id: string
  child_account_id: string
  amount: number
  transaction_type: TransactionType
  description: string
  balance_after: number
  created_by: string
  created_at: string
}

type CreateTransactionInput = {
  childAccountId: string
  amount: number
  transactionType: TransactionType
  description: string
}

function mapTransactionRow(row: TransactionRow): KidTransaction {
  return {
    id: row.id,
    childId: row.child_account_id,
    amount: Number(row.amount),
    type: row.transaction_type,
    description: row.description,
    createdAt: row.created_at,
    createdBy: row.created_by,
    balanceAfter: Number(row.balance_after),
  }
}

export async function listTransactions(childAccountId?: string): Promise<KidTransaction[]> {
  if (!supabase) {
    return listMockTransactions(childAccountId)
  }

  let query = supabase
    .from('transactions')
    .select('id, child_account_id, amount, transaction_type, description, balance_after, created_by, created_at')
    .order('created_at', { ascending: false })

  if (childAccountId) {
    query = query.eq('child_account_id', childAccountId)
  }

  const { data, error } = await query.returns<TransactionRow[]>()

  if (error) {
    throwFrenchError(error, 'Impossible de charger les transactions.')
  }

  return data.map(mapTransactionRow)
}

export async function createChildTransaction(input: CreateTransactionInput): Promise<KidTransaction> {
  if (!supabase) {
    return recordMockTransaction(input)
  }

  const client = requireSupabaseClient()
  const { data, error } = await client.rpc('create_child_transaction', {
    p_child_account_id: input.childAccountId,
    p_amount: input.amount,
    p_transaction_type: input.transactionType,
    p_description: input.description,
  })

  if (error) {
    throwFrenchError(error, 'Impossible de creer la transaction.')
  }

  return mapTransactionRow(data)
}
