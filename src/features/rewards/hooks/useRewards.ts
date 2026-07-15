import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listRewardClaims, listRewards, requestReward, reviewRewardClaim, saveReward } from '../services/rewardsService'

export const rewardsQueryKey = ['rewards'] as const
export const rewardClaimsQueryKey = ['reward-claims'] as const

export function useRewards() {
  return useQuery({
    queryKey: rewardsQueryKey,
    queryFn: listRewards,
  })
}

export function useRewardClaims(childAccountId?: string) {
  return useQuery({
    queryKey: childAccountId ? [...rewardClaimsQueryKey, childAccountId] : rewardClaimsQueryKey,
    queryFn: () => listRewardClaims(childAccountId),
  })
}

export function useRequestReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestReward,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardClaimsQueryKey })
    },
  })
}

export function useReviewRewardClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewRewardClaim,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardClaimsQueryKey })
      void queryClient.invalidateQueries({ queryKey: rewardsQueryKey })
    },
  })
}

export function useSaveReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveReward,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardsQueryKey })
    },
  })
}
