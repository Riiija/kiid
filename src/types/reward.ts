export type RewardClaimStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export type Reward = {
  id: string
  familyId: string
  name: string
  description: string
  cost: number
  icon: string
  isActive: boolean
  createdBy: string
  pendingClaims: number
}

export type RewardClaim = {
  id: string
  rewardId: string
  childId: string
  status: RewardClaimStatus
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  comment?: string
}
