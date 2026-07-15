// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { childrenQueryKey } from '../../children/hooks/useChildren'
import { createChildTransaction } from '../services/transactionsService'
import { transactionsQueryKey, useCreateChildTransaction } from './useTransactions'

vi.mock('../services/transactionsService', () => ({
  createChildTransaction: vi.fn(),
  listTransactions: vi.fn(),
}))

const createChildTransactionMock = vi.mocked(createChildTransaction)

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCreateChildTransaction', () => {
  beforeEach(() => {
    createChildTransactionMock.mockReset()
  })

  it('invalide le cache transactions et enfants apres mutation', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    createChildTransactionMock.mockResolvedValue({
      id: 'tx-test',
      childId: 'lucas',
      amount: 10,
      type: 'credit',
      description: 'Bonus',
      createdAt: new Date().toISOString(),
      createdBy: 'test',
      balanceAfter: 135,
    })

    const { result } = renderHook(() => useCreateChildTransaction(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({
        childAccountId: 'lucas',
        amount: 10,
        transactionType: 'credit',
        description: 'Bonus',
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: transactionsQueryKey })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: childrenQueryKey })
  })
})
