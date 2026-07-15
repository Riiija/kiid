import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listSavingsGoals, saveSavingsGoal } from '../services/savingsGoalsService'

export const savingsGoalsQueryKey = ['savings-goals'] as const

export function useSavingsGoals(childAccountId?: string) {
  return useQuery({
    queryKey: childAccountId ? [...savingsGoalsQueryKey, childAccountId] : savingsGoalsQueryKey,
    queryFn: () => listSavingsGoals(childAccountId),
  })
}

export function useSaveSavingsGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSavingsGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savingsGoalsQueryKey })
    },
  })
}
