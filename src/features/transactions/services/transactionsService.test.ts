import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabase', () => ({
  supabase: null,
  requireSupabaseClient: () => {
    throw new Error("Supabase n'est pas configure.")
  },
}))

import { resetMockRuntimeStore } from '../../../mocks/mockRuntimeStore'
import { createChildTransaction, listTransactions } from './transactionsService'

describe('transactionsService mock runtime', () => {
  beforeEach(() => {
    resetMockRuntimeStore()
  })

  it('ajoute des KidCoins et alimente lhistorique', async () => {
    const transaction = await createChildTransaction({
      childAccountId: 'lucas',
      amount: 20,
      transactionType: 'credit',
      description: 'Bonus test',
    })

    expect(transaction.amount).toBe(20)
    expect(transaction.balanceAfter).toBe(145)
    expect((await listTransactions('lucas'))[0]).toMatchObject({
      id: transaction.id,
      description: 'Bonus test',
    })
  })

  it('retire des KidCoins', async () => {
    const transaction = await createChildTransaction({
      childAccountId: 'lucas',
      amount: 25,
      transactionType: 'debit',
      description: 'Retrait test',
    })

    expect(transaction.amount).toBe(-25)
    expect(transaction.balanceAfter).toBe(100)
  })

  it('refuse un retrait qui rendrait le solde negatif', async () => {
    await expect(
      createChildTransaction({
        childAccountId: 'noah',
        amount: 500,
        transactionType: 'debit',
        description: 'Retrait trop grand',
      }),
    ).rejects.toThrow('Solde insuffisant')
  })
})
