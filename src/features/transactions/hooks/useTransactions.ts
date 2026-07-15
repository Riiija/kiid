import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { childrenQueryKey } from '../../children/hooks/useChildren'
import { createChildTransaction, listTransactions } from '../services/transactionsService'

export const transactionsQueryKey = ['transactions'] as const

export function useTransactions(childAccountId?: string) {
  return useQuery({
    queryKey: childAccountId ? [...transactionsQueryKey, childAccountId] : transactionsQueryKey,
    queryFn: () => listTransactions(childAccountId),
  })
}

export function useCreateChildTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createChildTransaction,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey })
      void queryClient.invalidateQueries({ queryKey: childrenQueryKey })
    },
  })
}
